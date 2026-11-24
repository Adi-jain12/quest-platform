import { GraphQLError } from 'graphql';
import { registerSchema } from './validation';
import bcrypt from 'bcryptjs';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
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