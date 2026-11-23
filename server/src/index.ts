import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { db } from "./prisma/db.js";

interface Context {
  db: typeof db;
}

const typeDefs = `#graphql
  type User {
    id: Int!
    name: String!
    email: String!
  }

  type Query {
    users: [User!]!
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
  }
`;

const resolvers = {
  Query: {
    users: (_: unknown, __: unknown, ctx: Context) =>
      ctx.db.orm.public.User.all(),
  },
  Mutation: {
    createUser: (_: unknown, args: { name: string; email: string }, ctx: Context) =>
      ctx.db.orm.public.User.create(args),
  },
};

const app = express();
const server = new ApolloServer<Context>({ typeDefs, resolvers });

await server.start(); // Apollo must start before it's attached to Express

app.use(
  "/graphql",
  cors({ origin: process.env.CLIENT_URL }), // allows your React app to call the API
  express.json(),                            // lets Express read the JSON request body
  expressMiddleware(server, {
    context: async () => ({ db }),           // makes db available in every resolver
  })
);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`🚀 GraphQL ready at http://localhost:${port}/graphql`);
});