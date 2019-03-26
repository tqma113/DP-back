import {
  user
} from '../../database';

const { 
  selectUserById,
  insertUser,
  selectUsers,
  deleteUserById,
  updateUserById
} = user;

export default {
  user: async (root, { id }, context, info) => {
    var users = await selectUserById(id);
    var user = users[0] || {};
    return user
  },
  users: async (root, args, context, info) => {
    const users = await selectUsers();
    return users
  }
}