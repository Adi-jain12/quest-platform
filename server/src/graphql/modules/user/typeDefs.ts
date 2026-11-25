export const userTypeDefs = `#graphql
  enum UserRole {
    USER
    HOST
    ADMIN
  }  

  type User {
    id: String!
    name: String!
    email: String!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  type RegisteredUser {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
  }

  type RegisterPayload {
    user: RegisteredUser!
  }

  type EmailCheckResponse {
    exists: Boolean!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type LoginPayload {
    accessToken: String!
    user: RegisteredUser!
  }

  type RefreshPayload {
    accessToken: String!
    user: RegisteredUser!
  }

  type Query {
    users: [User!]!
    checkEmail(email: String!): EmailCheckResponse!
    me: RegisteredUser!
  }

  type Mutation {
    register(input: RegisterInput!): RegisterPayload!
    login(input: LoginInput!): LoginPayload!
    refreshToken: RefreshPayload!
  }
`;
