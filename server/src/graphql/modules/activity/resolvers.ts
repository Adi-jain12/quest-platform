import { GraphQLError } from 'graphql';
import type { GraphQLContext } from "../../context.js";

import { requireAuth, requireRole } from '../../utils.js';
import { createActivitySchema, getActivitiesSchema, getMyHostedActivitiesSchema, updateActivitySchema, validateInput } from './validation.js';
import { cancelActivity, createActivity, getActivities, getActivityById, getActivityCategories, getMyHostedActivities, publishActivity, updateActivity } from './service.js';

export const activityResolvers = {
  Query: {

     activityCategories: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      return getActivityCategories(context.db);
    },

    activity: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      return getActivityById(
        args.id,
        context.user,
        context.db
      );
    },


    activities: async (
      _parent: unknown,
      args: { input?: unknown },
      context: GraphQLContext
    ) => {
      const input = validateInput(
        getActivitiesSchema,
        args.input ?? {}
      );

      return getActivities(input, context.db);
    },

    myHostedActivities: async (
      _parent: unknown,
      args: { input?: unknown },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const input = validateInput(
        getMyHostedActivitiesSchema,
        args.input ?? {}
      );

      return getMyHostedActivities(
        user.id,
        input,
        context.db
      );
    },
  

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


      updateActivity: async (
        _parent: unknown,
        args: {
          id: string;
          input: unknown;
        },
        context: GraphQLContext
      ) => {
        const user = requireRole(context, ["HOST", "ADMIN"]);

        const input = validateInput(
          updateActivitySchema,
          args.input
        );

        return updateActivity(
          args.id,
          input,
          user,
          context.db
        );
      },

      publishActivity: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const user = requireRole(context, ["HOST", "ADMIN"]);

      return publishActivity(
        args.id,
        user,
        context.db
      );
    },

    cancelActivity: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const user = requireRole(context, ["HOST", "ADMIN"]);

      return cancelActivity(
        args.id,
        user,
        context.db
      );
    },
    
  },

   Activity: {
    host: async (parent : { hostId: string }, _args : unknown, context: GraphQLContext) => {
      return context.db.orm.public.User
        .whereUnique({ id: parent.hostId })
        .first();
    },

    category: async (parent : { categoryId: string }, _args: unknown, context: GraphQLContext) => {
    return context.db.orm.public.ActivityCategory
      .whereUnique({ id: parent.categoryId })
      .first();
  },
  },
  

};
