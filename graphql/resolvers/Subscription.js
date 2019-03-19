const { PubSub, withFilter } = require('apollo-server');

const USER_ADDED = 'USER_ADDED';
const USER_UPDATED = 'USER_UPDATED';
const USER_DELETED = 'USER_DELETED';

export default {
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