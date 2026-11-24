import { userTypeDefs } from "./modules/user/typeDefs.js";
import { userResolvers } from "./modules/user/resolvers.js";

export const typeDefs = [userTypeDefs];

export const resolvers = {
  Query: {
    ...userResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
  },
};
