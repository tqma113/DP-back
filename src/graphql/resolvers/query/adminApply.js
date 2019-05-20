const adminApply = async (root, { }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo
    
    if (isValid) {
      let applications = []
      if (currentUser.user_type == 1) {
        applications = await dataSources.database.applyAdmin.selectApplyAdmins() || []
      } else {
        applications = await dataSources.database.applyAdmin.selectApplyAdminsByUserId(currentUser.id) || []
      }
      response = {
        applications,
        isSuccess: true,
        extension: {
          operator: 'adminApply query',
          errors
        }
      }
    } else {
      errors.push({
        path: 'adminApply',
        message: 'auth fail'
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "adminApply query",
          errors
        }
      }
    }
  } catch (err) {
    errors.push({
      path: 'adminApply',
      message: JSON.stringify(err)
    })

    response = {
      isSuccess: false,
      extension: {
        operator: "adminApply query",
        errors
      }
    }
  }
  return response
}

export default adminApply