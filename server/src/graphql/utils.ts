
import { GraphQLError } from "graphql";
import type {
  AuthenticatedUser,
  GraphQLContext,
} from "./context.js";

type UserRole = AuthenticatedUser["role"];

// Checks whether the user is logged in
export const requireAuth = (
  context: GraphQLContext
): AuthenticatedUser => {
  if (!context.user) {
    throw new GraphQLError("Authentication required.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  return context.user;
};

// Checks whether the user has one of the required roles
export const requireRole = (
  context: GraphQLContext,
  allowedRoles: UserRole[]
): AuthenticatedUser => {
  const user = requireAuth(context);

  if (!allowedRoles.includes(user.role)) {
    throw new GraphQLError("You are not authorized to perform this action.", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  return user;
};
