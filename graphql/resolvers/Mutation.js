const { PubSub, withFilter } = require('apollo-server');

import {
  user
} from '../database';

const { 
  insertUser,
  deleteUserById,
  updateUserById
} = user;

const USER_ADDED = 'USER_ADDED';
const USER_UPDATED = 'USER_UPDATED';
const USER_DELETED = 'USER_DELETED';

const pubsub = new PubSub();

export default {
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
  }
}