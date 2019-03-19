import { gql } from 'apollo-server-express';

// Construct a schema, using GraphQL schema language
const schema = gql`
type Query {
  users: [User]!
  user(id: ID!): User!
}

type Mutation {
  createUser(name: String!, address: String!): User!
  deleteUser(id: ID!): User!
  updateUser(id: ID!, key: String!, value: String!): User!
}

type Subscription {
  newUser: User!
  updatedUser: User!
  deletedUser: User!
}


type User {
  id: ID!
  name: String!
  address: String!
  gender: Boolean!
  degree: Degree!
  create_at: Date!
}

enum Degree {
  BACHELOR
  MASTER
  DOCTOR
  OTHER
}

scalar Date
`;

export default schema;