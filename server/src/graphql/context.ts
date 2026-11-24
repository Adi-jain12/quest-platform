import { db } from "../prisma/db.js";

export interface GraphQLContext {
  db: typeof db;
}

export const createContext = async (): Promise<GraphQLContext> => ({ db });
