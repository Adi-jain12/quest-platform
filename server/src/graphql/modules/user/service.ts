import { GraphQLError } from 'graphql';
import { loginSchema, registerSchema } from './validation';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { randomBytes, createHash, randomUUID } from "node:crypto";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

const hashToken = (token: string) => {
  return createHash("sha256")
    .update(token)
    .digest("hex");
};

export const checkEmailExists = async (email: string, db: any) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await db.orm.public.User.where({ email: normalizedEmail }).first();

  return {
    exists: Boolean(user),
  };
};



export const registerUser = async (input: RegisterInput, db: any) => {
  // 1. Validate input
  const validation = registerSchema.safeParse(input);

  if (!validation.success) {
    throw new GraphQLError("Invalid registration details.", {
      extensions: {
        code: "BAD_USER_INPUT",
        errors: validation.error.flatten().fieldErrors,
      },
    });
  }

  // 2. Normalize email
  const { name, email, password } = validation.data;
  const normalizedEmail = email.toLowerCase();

  // 3. Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    // 4. Create user
    const user = await db.orm.public.User
      .select("id", "name", "email", "role")
      .create({
        name,
        email: normalizedEmail,
        passwordHash,
      });

    return user;
  } catch (error) {
    // 5. Handle duplicate email
    if (
      typeof error === "object" &&
      error !== null &&
      "sqlState" in error &&
      error.sqlState === "23505"
    ) {
      throw new GraphQLError("An account with this email already exists.", {
        extensions: {
          code: "EMAIL_ALREADY_EXISTS",
        },
      });
    }

    throw error;
  }
};


export const loginUser = async (input: LoginInput, db: any) => {
  // 1. Validate input
  const validation = loginSchema.safeParse(input);

  if (!validation.success) {
    throw new GraphQLError("Invalid login details.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const { email, password } = validation.data;
  const normalizedEmail = email.toLowerCase();

  // 2. Find user by unique email
  const user = await db.orm.public.User
    .whereUnique({ email: normalizedEmail })
    .first();

  // 3. Verify password
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new GraphQLError("Invalid email or password.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  // 4. Generate access token
  const accessToken = jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: "15m",
      algorithm: "HS256",
    }
  );

  // 5. Generate refresh token
  const refreshToken = randomBytes(64).toString("hex");

  // 6. Hash refresh token before storing it
  const tokenHash = createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // 7. Calculate expiration
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  // 8. Create refresh session
  await db.orm.public.RefreshSession.create({
    tokenHash,
    familyId: randomUUID(),
    userId: user.id,
    expiresAt,
  });

  // 9. Return refresh token separately for cookie handling
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};



const createAccessToken = (user: {
  id: string;
  role: string;
}) => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    secret,
    {
      expiresIn: "15m",
    }
  );
};

export const refreshAccessToken = async (
  rawRefreshToken: string,
  db: any
) => {
  const tokenHash = hashToken(rawRefreshToken);
  const now = new Date();

  const result = await db.transaction(async (tx : any) => {
    // 1. Find and lock the refresh token record
    const session = await tx.orm.public.RefreshSession
      .where({ tokenHash })
      .forUpdate()
      .first();

    if (!session) {
      return { status: "INVALID" as const };
    }

    // 2. Detect previously used refresh tokens
    if (session.revokedAt) {
      if (session.replacedByTokenHash && session.familyId) {
        // Reuse detected: revoke the entire token family
        await tx.orm.public.RefreshSession
          .where({ familyId: session.familyId })
          .updateAll({
            revokedAt: now,
          });

        return { status: "REUSED" as const };
      }

      return { status: "INVALID" as const };
    }

    // 3. Check expiration
    if (session.expiresAt <= now) {
      await tx.orm.public.RefreshSession
        .where({ id: session.id })
        .update({
          revokedAt: now,
        });

      return { status: "EXPIRED" as const };
    }

    // 4. Check token family
    if (!session.familyId) {
      await tx.orm.public.RefreshSession
        .where({ id: session.id })
        .update({
          revokedAt: now,
        });

      return { status: "INVALID" as const };
    }

    // 5. Find the associated user
    const user = await tx.orm.public.User
      .whereUnique({ id: session.userId })
      .first();

    if (!user) {
      await tx.orm.public.RefreshSession
        .where({ familyId: session.familyId })
        .updateAll({
          revokedAt: now,
        });

      return { status: "INVALID" as const };
    }

    // 6. Generate a new refresh token
    const newRefreshToken = randomBytes(64).toString("hex");
    const newTokenHash = hashToken(newRefreshToken);

    // 7. Revoke the old token and record its replacement
    await tx.orm.public.RefreshSession
      .where({ id: session.id })
      .update({
        revokedAt: now,
        lastUsedAt: now,
        replacedByTokenHash: newTokenHash,
      });

    // 8. Create a new token record in the same family
    await tx.orm.public.RefreshSession.create({
      tokenHash: newTokenHash,
      familyId: session.familyId,
      userId: user.id,
      expiresAt: session.expiresAt,
    });

    // 9. Generate a new access token
    const accessToken = createAccessToken(user);

    return {
      status: "SUCCESS" as const,
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      expiresAt: session.expiresAt,
    };
  });

  // Throw outside the transaction so security revocations commit.
  if (result.status !== "SUCCESS") {
    throw new GraphQLError("Refresh token is invalid or expired.", {
      extensions: {
        code: "UNAUTHENTICATED",
      },
    });
  }

  return result;
};