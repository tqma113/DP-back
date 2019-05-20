

const messages = async (root, { userId }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let acceptUser = (await dataSources.database.user.selectUserById(userId))[0]
    let isValid = !!sessionInfo && currentUser && acceptUser && acceptUser.id

    if (isValid) {
      let messages = await dataSources.database.message.selectMessageByASUserId(userId, currentUser.id)
      messages.map(item => {
        if (item.a_user_id == acceptUser.id) {
          item.acceptUser = acceptUser
          item.sendUser = currentUser
        } else {
          item.acceptUser = currentUser
          item.sendUser = acceptUser
        }
        return item
      })
      response = {
        messages,
        isSuccess: true,
        extension: {
          operator: 'checkLoginState',
          errors
        }
      }
    } else {
      if (!sessionInfo || !currentUser) {
        errors.push({
          path: 'sendMessage',
          message: 'auth fail'
        })
      }

      if (!acceptUser || !acceptUser.id) {
        errors.push({
          path: 'sendMessage',
          message: 'accept user is not exist'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'checkLoginState',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'checkLoginState',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: 'checkLoginState',
        errors
      }
    }
  }

  return response
}

export default messages