import type { Request, Response } from "express";
import { db } from "../prisma/db.js";

export interface GraphQLContext {
  db: typeof db;
  req: Request;
  res: Response;
}

export const createContext = async ({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<GraphQLContext> => ({
  db,
  req,
  res,
});