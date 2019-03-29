const { PubSub, withFilter } = require('apollo-server');

const USER_ADDED = 'USER_ADDED';
const USER_UPDATED = 'USER_UPDATED';
const USER_DELETED = 'USER_DELETED';

const pubsub = new PubSub();

export default {
  createUser: async (root, { name, address }, { dataSources }, info) => {
    const user = await dataSources.user.insertUser({name, address});
    pubsub.publish(USER_ADDED, { user });
    return user;
  },
  deleteUser: async (root, { id }, { dataSources }, info) => {
    const user = await dataSources.user.deleteUserById(id);
    pubsub.publish(USER_DELETED, { user });
    return user;
  },
  updateUser: async (root, { id, key, value }, { dataSources }, info) => {
    const user = await dataSources.user.updateUserById(id, key, value);
    pubsub.publish(USER_UPDATED, { user });
    return user;
  },
  login: async (root, { username, password }, { dataSources }, info) => {
    return {
      success: true,
      token: 'adfadfs',
      username
    }
  },
  upload: async (root, { files }, { dataSources }, info) => {
    let uploadInfos = []

    for (let file of files) {
      const { stream, filename, mimetype, encoding } = await file;
      let uploadInfo = {
        filename,
        success: true,
        extension: ''
      }

      try {
        // TODO file storage

      } catch (err) {
        uploadInfo.success = false
        uploadInfo.extension = JSON.stringify(err)
      }

      uploadInfos.push(uploadInfo)
    }

    return uploadInfos
  },
}