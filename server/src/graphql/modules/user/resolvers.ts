import { GraphQLError } from 'graphql';
import type { GraphQLContext } from "../../context.js";
import { checkEmailExists, loginUser, refreshAccessToken, registerUser } from './service.js';

export const userResolvers = {
  Query: {
    users: (_parent: unknown, _args: unknown, { db }: GraphQLContext) =>
      db.orm.public.User.all(),

    checkEmail: async (
      _parent: unknown,
      args: { email: string },
      { db }: GraphQLContext,
    ) => {
      return checkEmailExists(args.email, db);
    }
  },
  Mutation: {
    // createUser: (
    //   _parent: unknown,
    //   args: { name: string; email: string },
    //   { db }: GraphQLContext,
    // ) => db.orm.public.User.create(args),

     register: async (
      _: unknown,
      args: { input: {
        name: string;
        email: string;
        password: string;
      }},
      { db }: GraphQLContext,
    ) => {
      const user = await registerUser(args.input, db);

      return { user };
    },


     login: async (
      _: unknown,
      args: {
        input: {
          email: string;
          password: string;
        };
      },
      {db, res}: GraphQLContext
    ) => {
      const result = await loginUser(args.input, db);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
          process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/graphql",
      });

      return {
        accessToken: result.accessToken,
        user: result.user,
      };
    },

    refreshToken: async (
      _: unknown,
      __: unknown,
      {req, res, db}: GraphQLContext
    ) => {
     
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new GraphQLError("Refresh token missing.", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      // 2. Validate and rotate refresh token
      const result = await refreshAccessToken(refreshToken, db);

      // 3. Set the new refresh token cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
          process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: Math.max(
          0,
          result.expiresAt.getTime() - Date.now()
        ),
        path: "/graphql",
      });

      // 4. Return only public information
      return {
        accessToken: result.accessToken,
        user: result.user,
      };
    },















  },

  

};
