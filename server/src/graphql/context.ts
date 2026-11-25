
import type { Request, Response } from "express";
import { GraphQLError } from "graphql";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { db } from "../prisma/db.js";

type UserRole = "USER" | "HOST" | "ADMIN";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface GraphQLContext {
  db: typeof db;
  req: Request;
  res: Response;
  user: AuthenticatedUser | null;
}

export const createContext = async ({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<GraphQLContext> => {
  let user: AuthenticatedUser | null = null;

  const authorization = req.get("authorization");

  if (authorization) {
    const [scheme, token, ...extra] = authorization.split(" ");

    if (
      scheme !== "Bearer" ||
      !token ||
      extra.length > 0
    ) {
      throw new GraphQLError("Invalid authorization header.", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET is not configured.");
    }

    try {
      const decoded = jwt.verify(token, secret, {
        algorithms: ["HS256"],
      });

      if (
        typeof decoded === "string" ||
        typeof decoded.sub !== "string"
      ) {
        throw new Error("Invalid token payload.");
      }

      console.log("Decoded JWT payload:", decoded);

      const currentUser = await db.orm.public.User
        .whereUnique({ id: decoded.sub })
        .first();

      if (currentUser) {
        user = {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
        };
      }
    } catch {
      throw new GraphQLError("Invalid or expired access token.", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    if (!user) {
      throw new GraphQLError("User account not found.", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }
  }

  console.log("Context created for user:", user);

  return {
    db,
    req,
    res,
    user,
  };
};
