import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { createContext, type GraphQLContext } from "./graphql/context.js";
import { resolvers, typeDefs } from "./graphql/schema.js";
import cookieParser from "cookie-parser";

const app = express();
const server = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });

await server.start(); // Apollo must start before it's attached to Express

app.use(
  "/graphql",
  cors({ origin: process.env.CLIENT_URL, credentials: true, }),
  express.json(),                       
  cookieParser(),                        
  expressMiddleware(server, {
    context: createContext,
  })
);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`🚀 GraphQL ready at http://localhost:${port}/graphql`);
});