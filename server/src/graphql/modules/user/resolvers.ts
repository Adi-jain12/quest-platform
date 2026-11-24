import type { GraphQLContext } from "../../context.js";
import { checkEmailExists, registerUser } from './service.js';

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

       console.log("Register result:", user);

      return { user };
    },
  },

  

};
