export default {
  user: async (root, { id }, { dataSources }, info) => {
    let users = await dataSources.user.selectUserById(id);
    let user = users[0] || {};
    return user
  },
  users: async (root, args, { dataSources }, info) => {
    const users = await dataSources.user.selectUsers();
    return users
  }
}