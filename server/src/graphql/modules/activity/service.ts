import { GraphQLError } from "graphql";
import type { createActivitySchema, getActivitiesSchema } from "./validation.js";
import type { z } from "zod";

type CreateActivityInput = z.infer<typeof createActivitySchema>;

interface RequestingUser {
  id: string;
  role: "USER" | "HOST" | "ADMIN";
}

type GetActivitiesInput = z.infer<typeof getActivitiesSchema>;

export async function createActivity(
  input: CreateActivityInput,
  userId: string,
  db : any
) {
  // 1. Check whether the category exists
  const category = await db.orm.public.ActivityCategory
    .whereUnique({ id: input.categoryId })
    .first();

  if (!category) {
    throw new GraphQLError("Activity category not found.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  // 2. Check whether the category is active
  if (!category.isActive) {
    throw new GraphQLError("This activity category is currently unavailable.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  // 3. Create the activity
  const activity = await db.orm.public.Activity.create({
    title: input.title,
    description: input.description,
    coverImage: input.coverImage ?? null,

    hostId: userId,
    categoryId: input.categoryId,

    locationName: input.locationName,
    address: input.address ?? null,

    startsAt: new Date(input.startsAt),
    endsAt: input.endsAt ? new Date(input.endsAt) : null,

    capacity: input.capacity,
  });

  return activity;
}


export async function getActivityCategories(
  db: any
) {
  return await db.orm.public.ActivityCategory
    .where({ isActive: true })
    .orderBy((category : { name: any }) => category.name.asc())
    .all();
}


export async function getActivityById(
  id: string,
  user: RequestingUser | null,
  db: any
) {

  const activity = await db.orm.public.Activity
    .whereUnique({ id })
    .first();

  // Activity doesn't exist
  if (!activity) {
    return null;
  }

  // Published activities are publicly accessible
  if (activity.status === "PUBLISHED") {
    return activity;
  }

  // Admin can access all activities
  if (user?.role === "ADMIN") {
    return activity;
  }

  // Host can access their own activities
  if (user?.id === activity.hostId) {
    return activity;
  }

  return null;
}



export async function getActivities(
  input: GetActivitiesInput,
  db: any
) {
  const limit = input.limit ?? 20;
  const offset = input.offset ?? 0;
  const now = new Date();

  let query = db.orm.public.Activity
    .where({ status: "PUBLISHED" })
    .where((activity : { startsAt: any }) => activity.startsAt.gte(now));

  // Apply category filter only when provided
  if (input.categoryId) {
    query = query.where({ categoryId: input.categoryId });
  }

  const activities = await query
    .orderBy([
      (activity : { startsAt: any }) => activity.startsAt.asc(),
      (activity : { id: any }) => activity.id.asc(),
    ])
    .limit(limit)
    .offset(offset)
    .all();

  return activities;
}