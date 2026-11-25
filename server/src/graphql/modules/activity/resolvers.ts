import { GraphQLError } from 'graphql';
import type { GraphQLContext } from "../../context.js";

import { requireAuth, requireRole } from '../../utils.js';
import { createActivitySchema, validateInput } from './validation.js';
import { createActivity } from './service.js';

export const activityResolvers = {
  Query: {

  

  },
  Mutation: {

    createActivity: async (
        _parent : unknown,
        args : any,
        context: GraphQLContext
        ) => {
        const user = requireRole(context, ["HOST", "ADMIN"]);

        const input = validateInput(
            createActivitySchema,
            args.input
        );

        return createActivity(input, user.id, context.db);
        },
    
  },

   Activity: {
    host: async (parent : { hostId: string }, _args : unknown, context: GraphQLContext) => {
      return context.db.orm.public.User
        .whereUnique({ id: parent.hostId })
        .first();
    },

    // category: async (parent, _args, context: GraphQLContext) => {
    //   return context.db.orm.public.ActivityCategory
    //     .whereUnique({ id: parent.categoryId })
    //     .first();
    // },

    // approvedCount: async (parent, _args, context: GraphQLContext) => {
    //   // We'll implement this when we cover participation queries.
    // },
  },
  

};
