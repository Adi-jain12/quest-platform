import { GraphQLError } from "graphql";
import type { createActivitySchema } from "./validation.js";
import type { z } from "zod";

type CreateActivityInput = z.infer<typeof createActivitySchema>;

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
    // Status is intentionally omitted.
    // The database default is DRAFT.
  });

  return activity;
}