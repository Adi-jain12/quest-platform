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

  type Query {
    users: [User!]!
    checkEmail(email: String!): EmailCheckResponse!
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    register(input: RegisterInput!): RegisterPayload!
  }
`;
