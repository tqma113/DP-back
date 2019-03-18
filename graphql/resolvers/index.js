import { GraphQLScalarType } from 'graphql';
import { PubSub, withFilter } from 'apollo-server';

const {
  user,
  bank_card
} = require('./database');

const { 
  selectUserById,
  insertUser,
  selectUsers,
  deleteUserById,
  updateUserById
} = user;

const { 
  selectBCById,
  selectBCByUserId,
  insertBC,
  selectBCs,
  deleteBCById,
  updateBCById
} = bank_card;

const USER_ADDED = 'USER_ADDED';
const USER_UPDATED = 'USER_UPDATED';
const USER_DELETED = 'USER_DELETED';

const pubsub = new PubSub();

const resolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  }),
  Query: {
    user: async (root, { id }, context, info) => {
      var users = await selectUserById(id);
      var user = users[0] || {};
      if (user.id) {
        const bankCards = await selectBCByUserId(id)
        user.bank_cards = {
          totalCount: bankCards.length,
          data: bankCards
        }
      }
      return user
    },
    users: async (root, args, context, info) => {
      const users = (await selectUsers()).map(async user => {
        if (user.id) {
          const bankCards = await selectBCByUserId(user.id)
          user.bank_cards = {
            totalCount: bankCards.length,
            data: (root, args, context, info) => {
              return context.variableValues.first ? 
                bankCards.slice(0, context.variableValues.first) : 
                context.variableValues.last ? 
                bankCards.slice(0, context.variableValues.last) : bankCards;
            }
          }
        }
        return user
      });
      return {
        totalCount: users.length,
        data: (root, args, context, info) => {
          return context.variableValues.first ? 
            users.slice(0, context.variableValues.first) :
            context.variableValues.last ? 
            users.slice(0, context.variableValues.last) : users;
        }
      }
    },
    bankCard: async (root, { id }, context, info) => {
      return (await selectBCById(id))[0];
    },
    bankCards: async (root, args, context, info) => {
      return await selectBCs();
    },
    bankCardByUserId: async (root, { userId }, context, info) => {
      return await selectBCByUserId(userId);
    }
  },
  Mutation: {
    createUser: async (root, { name, address }, context, info) => {
      const user = await insertUser({name, address});
      pubsub.publish(USER_ADDED, { user });
      return user;
    },
    deleteUser: async (root, { id }, context, info) => {
      const user = await deleteUserById(id);
      pubsub.publish(USER_DELETED, { user });
      return user;
    },
    updateUser: async (root, { id, key, value }, context, info) => {
      const user = await updateUserById(id, key, value);
      pubsub.publish(USER_UPDATED, { user });
      return user;
    },
    createBS: async (root, { bankName, cardNumber, userId }, context, info) => {
      return await insertBC({ bankName, cardNumber, userId });
    }
  },
  Subscription: {
    newUser: {
      subscribe: () =>  pubsub.asyncIterator([USER_ADDED]),
      resolve: ({ user }) =>  user
    },
    updatedUser: {
      subscribe: () => pubsub.asyncIterator([USER_UPDATED]),
      resolve: ({ user }) =>  user
    },
    deletedUser: {
      subscribe: () => pubsub.asyncIterator([USER_DELETED]),
      resolve: ({ user }) =>  user
    }
  }
};

module.exports = resolvers;