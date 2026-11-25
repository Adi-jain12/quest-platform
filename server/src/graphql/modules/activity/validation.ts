import { z } from "zod";
import { GraphQLError } from "graphql";

// Reusable date validation
const dateTimeSchema = z.iso.datetime({
  offset: true,
});

// CREATE ACTIVITY
export const createActivitySchema = z
  .object({
    title: z.string().trim().min(5).max(100),

    description: z.string().trim().min(20).max(5000),

    coverImage: z.url().nullable().optional(),

    categoryId: z.string().min(1),

    locationName: z.string().trim().min(2).max(150),

    address: z.string().trim().max(500).nullable().optional(),

    startsAt: dateTimeSchema,

    endsAt: dateTimeSchema.nullable().optional(),

    capacity: z.number().int().positive(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.endsAt && new Date(data.endsAt) <= new Date(data.startsAt)) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End date must be later than start date.",
      });
    }
  });

// UPDATE ACTIVITY
export const updateActivitySchema = z
  .object({
    title: z.string().trim().min(5).max(100).optional(),

    description: z.string().trim().min(20).max(5000).optional(),

    coverImage: z.url().nullable().optional(),

    categoryId: z.string().min(1).optional(),

    locationName: z.string().trim().min(2).max(150).optional(),

    address: z.string().trim().max(500).nullable().optional(),

    startsAt: dateTimeSchema.optional(),

    endsAt: dateTimeSchema.nullable().optional(),

    capacity: z.number().int().positive().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field must be provided for update.",
      });
    }

    if (
      data.startsAt &&
      data.endsAt &&
      new Date(data.endsAt) <= new Date(data.startsAt)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End date must be later than start date.",
      });
    }
  });

// VALIDATION HELPER
export function validateInput<T extends z.ZodType>(
  schema: T,
  input: unknown
): z.infer<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new GraphQLError("Invalid input.", {
      extensions: {
        code: "BAD_USER_INPUT",
        validationErrors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
  }

  return result.data;
}