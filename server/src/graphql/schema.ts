import { userTypeDefs } from "./modules/user/typeDefs.js";
import { userResolvers } from "./modules/user/resolvers.js";
import { activityTypeDefs } from './modules/activity/typeDefs.js';
import { activityResolvers } from './modules/activity/resolvers.js';

export const typeDefs = [userTypeDefs, activityTypeDefs];

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...activityResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...activityResolvers.Mutation,
  },
  Activity: {
    ...activityResolvers.Activity,
  },
};
