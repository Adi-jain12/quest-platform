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
    
  }
  

};
