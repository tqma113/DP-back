import { gql } from 'apollo-server-express';

// Construct a schema, using GraphQL schema language
const schema = gql`
type Query {
  users: Users!
  user(id: ID!): User!
  bankCards: [BankCard]!
  bankCard(id: ID!): BankCard!
  bankCardByUserId(userId: Int!): [BankCard!]
}

type Mutation {
  createUser(name: String!, address: String!): User!
  deleteUser(id: ID!): User!
  updateUser(id: ID!, key: String!, value: String!): User!
  createBS(bankName: String!, cardNumber: String!, userId: Int!): BankCard!
}

type Subscription {
  newUser: User!
  updatedUser: User!
  deletedUser: User!
}

type Users {
  totalCount: Int!
  data(first: Int, last: Int): [User!]
}

type User {
  id: ID!
  name: String!
  address: String!
  gender: Boolean!
  degree: Degree!
  create_at: Date!
  bank_cards: BankCards!
}

type BankCards {
  totalCount: Int!
  data(first: Int, last: Int): [BankCard!]
}

type BankCard {
  id: ID!
  bank_name: String!
  card_number: String!
  user_id: Int!
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