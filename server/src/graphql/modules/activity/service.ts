import { GraphQLError } from "graphql";
import type { createActivitySchema, getActivitiesSchema, getMyHostedActivitiesSchema, updateActivitySchema } from "./validation.js";
import type { z } from "zod";

interface RequestingUser {
  id: string;
  role: "USER" | "HOST" | "ADMIN";
}

export async function createActivity(
  input: z.infer<typeof createActivitySchema>,
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
  input: z.infer<typeof getActivitiesSchema>,
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

export async function getMyHostedActivities(
  userId: string,
  input: z.infer<typeof getMyHostedActivitiesSchema>,
  db: any
) {
  const limit = input.limit ?? 20;
  const offset = input.offset ?? 0;

  const activities = await db.orm.public.Activity
    .where({ hostId: userId })
    .orderBy([
      (activity : { createdAt: any }) => activity.createdAt.desc(),
      (activity : { id: any }) => activity.id.desc(),
    ])
    .limit(limit)
    .offset(offset)
    .all();

  return activities;
}



export async function updateActivity(
  activityId: string,
  input: z.infer<typeof updateActivitySchema>,
  user: RequestingUser,
  db: any
) {
  // 1. Find the activity
  const activity = await db.orm.public.Activity
    .whereUnique({ id: activityId })
    .first();

  if (!activity) {
    throw new GraphQLError("Activity not found.", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // 2. Check ownership
  if (user.role !== "ADMIN" && activity.hostId !== user.id) {
    throw new GraphQLError(
      "You are not authorized to edit this activity.",
      { extensions: { code: "FORBIDDEN" } }
    );
  }

  // 3. Check activity status
  if (
    activity.status === "CANCELLED" ||
    activity.status === "COMPLETED"
  ) {
    throw new GraphQLError(
      "Cancelled or completed activities cannot be edited.",
      { extensions: { code: "BAD_USER_INPUT" } }
    );
  }

  // 4. Validate category if being changed
  if (input.categoryId !== undefined) {
    const category = await db.orm.public.ActivityCategory
      .whereUnique({ id: input.categoryId })
      .first();

    if (!category || !category.isActive) {
      throw new GraphQLError(
        "Selected activity category is unavailable.",
        { extensions: { code: "BAD_USER_INPUT" } }
      );
    }
  }

  // 5. Validate the combined dates
  const nextStartsAt =
    input.startsAt !== undefined
      ? new Date(input.startsAt)
      : activity.startsAt;

  const nextEndsAt =
    input.endsAt !== undefined ? input.endsAt ? new Date(input.endsAt) : null : activity.endsAt;

  if (nextEndsAt && nextEndsAt <= nextStartsAt) {
    throw new GraphQLError(
      "End date must be later than start date.",
      { extensions: { code: "BAD_USER_INPUT" } }
    );
  }

  // 6. Prevent capacity from going below approved participants
  if (input.capacity !== undefined) {
    const { approvedCount } = await db.orm.public.Participation
      .where({
        activityId,
        status: "APPROVED",
      })
      .aggregate((aggregate : { count: () => number }) => ({
        approvedCount: aggregate.count(),
      }));

    if (input.capacity < approvedCount) {
      throw new GraphQLError(
        `Capacity cannot be lower than the ${approvedCount} approved participants.`,
        { extensions: { code: "BAD_USER_INPUT" } }
      );
    }
  }

  // 7. Build update data
  const updateData = {
    ...(input.title !== undefined && {
      title: input.title,
    }),
    ...(input.description !== undefined && {
      description: input.description,
    }),
    ...(input.coverImage !== undefined && {
      coverImage: input.coverImage,
    }),
    ...(input.categoryId !== undefined && {
      categoryId: input.categoryId,
    }),
    ...(input.locationName !== undefined && {
      locationName: input.locationName,
    }),
    ...(input.address !== undefined && {
      address: input.address,
    }),
    ...(input.startsAt !== undefined && {
      startsAt: nextStartsAt,
    }),
    ...(input.endsAt !== undefined && {
      endsAt: nextEndsAt,
    }),
    ...(input.capacity !== undefined && {
      capacity: input.capacity,
    }),
  };

  // 8. Update the activity
  const updatedActivity = await db.orm.public.Activity
    .where(
      user.role === "ADMIN"
        ? { id: activityId }
        : { id: activityId, hostId: user.id }
    )
    .update(updateData);

  if (!updatedActivity) {
    throw new GraphQLError("Unable to update activity.", {
      extensions: { code: "INTERNAL_SERVER_ERROR" },
    });
  }

  return updatedActivity;
}


export async function publishActivity(
  activityId: string,
  user: RequestingUser,
  db: any
) {
  // 1. Find activity
  const activity = await db.orm.public.Activity
    .whereUnique({ id: activityId })
    .first();

  if (!activity) {
    throw new GraphQLError("Activity not found.", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // 2. Check ownership
  if (user.role !== "ADMIN" && activity.hostId !== user.id) {
    throw new GraphQLError(
      "You are not authorized to publish this activity.",
      { extensions: { code: "FORBIDDEN" } }
    );
  }

  // 3. Only drafts can be published
  if (activity.status !== "DRAFT") {
    throw new GraphQLError(
      "Only draft activities can be published.",
      { extensions: { code: "BAD_USER_INPUT" } }
    );
  }

  // 4. Activity must be in the future
  if (activity.startsAt <= new Date()) {
    throw new GraphQLError(
      "An activity must have a future start date to be published.",
      { extensions: { code: "BAD_USER_INPUT" } }
    );
  }

  // 5. Category must still be active
  const category = await db.orm.public.ActivityCategory
    .whereUnique({ id: activity.categoryId })
    .first();

  if (!category || !category.isActive) {
    throw new GraphQLError(
      "This activity's category is unavailable.",
      { extensions: { code: "BAD_USER_INPUT" } }
    );
  }

  // 6. Update only if the activity is still a draft
  const updatedActivity =
    user.role === "ADMIN"
      ? await db.orm.public.Activity
          .where({
            id: activityId,
            status: "DRAFT",
          })
          .update({ status: "PUBLISHED" })
      : await db.orm.public.Activity
          .where({
            id: activityId,
            hostId: user.id,
            status: "DRAFT",
          })
          .update({ status: "PUBLISHED" });

  if (!updatedActivity) {
    throw new GraphQLError(
      "Activity could not be published. Its status may have changed.",
      { extensions: { code: "CONFLICT" } }
    );
  }

  return updatedActivity;
}

export async function cancelActivity(
  activityId: string,
  user: RequestingUser,
  db: any
) {
  // 1. Find activity
  const activity = await db.orm.public.Activity
    .whereUnique({ id: activityId })
    .first();

  if (!activity) {
    throw new GraphQLError("Activity not found.", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // 2. Check ownership
  if (user.role !== "ADMIN" && activity.hostId !== user.id) {
    throw new GraphQLError(
      "You are not authorized to cancel this activity.",
      { extensions: { code: "FORBIDDEN" } }
    );
  }

  // 3. Only published activities can be cancelled
  if (activity.status !== "PUBLISHED") {
    throw new GraphQLError(
      "Only published activities can be cancelled.",
      { extensions: { code: "BAD_USER_INPUT" } }
    );
  }

  // 4. Update only if the activity is still published
  const updatedActivity =
    user.role === "ADMIN"
      ? await db.orm.public.Activity
          .where({
            id: activityId,
            status: "PUBLISHED",
          })
          .update({ status: "CANCELLED" })
      : await db.orm.public.Activity
          .where({
            id: activityId,
            hostId: user.id,
            status: "PUBLISHED",
          })
          .update({ status: "CANCELLED" });

  if (!updatedActivity) {
    throw new GraphQLError(
      "Activity could not be cancelled. Its status may have changed.",
      { extensions: { code: "CONFLICT" } }
    );
  }

  return updatedActivity;
}