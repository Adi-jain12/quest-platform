export const activityTypeDefs = `#graphql

enum ActivityStatus {
  DRAFT
  PUBLISHED
  CANCELLED
  COMPLETED
}

type ActivityCategory {
  id: ID!
  name: String!
  slug: String!
  isActive: Boolean!
}

type Activity {
  id: ID!
  title: String!
  description: String!
  coverImage: String

  locationName: String!
  address: String

  startsAt: String!
  endsAt: String

  capacity: Int!
  approvedCount: Int!

  status: ActivityStatus!

  category: ActivityCategory!
  host: User!

  createdAt: String!
  updatedAt: String!
}

input CreateActivityInput {
  title: String!
  description: String!
  coverImage: String

  categoryId: ID!

  locationName: String!
  address: String

  startsAt: String!
  endsAt: String

  capacity: Int!
}

input UpdateActivityInput {
  title: String
  description: String
  coverImage: String

  categoryId: ID

  locationName: String
  address: String

  startsAt: String
  endsAt: String

  capacity: Int
}

input GetActivitiesInput {
  categoryId: ID
  limit: Int
  offset: Int
}

input GetMyHostedActivitiesInput {
  limit: Int
  offset: Int
}

type Query {
  activities: [Activity!]!
  activity(id: ID!): Activity
  activityCategories: [ActivityCategory!]!
  myHostedActivities: [Activity!]!
  activities(input: GetActivitiesInput): [Activity!]!
  myHostedActivities(input: GetMyHostedActivitiesInput): [Activity!]!
}

type Mutation {
  createActivity(input: CreateActivityInput!): Activity!
  updateActivity(id: ID!, input: UpdateActivityInput!): Activity!
  publishActivity(id: ID!): Activity!
  cancelActivity(id: ID!): Activity!
}

`;
