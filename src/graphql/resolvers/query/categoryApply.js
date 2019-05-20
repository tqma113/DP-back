const categoryApply = async (root, { }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo
    
    if (isValid) {
      let applications = []
      if (currentUser.user_type == 1) {
        applications = await dataSources.database.applyAddCategory.selectApplyAddCategorys() || []
      } else {
        applications = await dataSources.database.applyAddCategory.selectApplyAddCategorysByUserId(currentUser.id) || []
      }
      response = {
        applications,
        isSuccess: true,
        extension: {
          operator: 'categoryApply query',
          errors
        }
      }
    } else {
      errors.push({
        path: 'categoryApply',
        message: 'auth fail'
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "categoryApply query",
          errors
        }
      }
    }
  } catch (err) {
    errors.push({
      path: 'categoryApply',
      message: JSON.stringify(err)
    })

    response = {
      isSuccess: false,
      extension: {
        operator: "categoryApply query",
        errors
      }
    }
  }
  return response
}

export default categoryApply