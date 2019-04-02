const { PubSub, withFilter } = require('apollo-server');

const USER_ADDED = 'USER_ADDED';
const USER_UPDATED = 'USER_UPDATED';
const USER_DELETED = 'USER_DELETED';

const pubsub = new PubSub();

export default {
  register: async (root, { username, nickname, password, hd_portrial, gender, address, birthday, industry, mailbox}, { dataSources }, info) => {
    return {

    }
  }
}