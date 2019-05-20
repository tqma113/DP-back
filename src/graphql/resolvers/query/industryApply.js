const industryApply = async (root, { }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = currentUser && sessionInfo
    
    if (isValid) {
      let applications = []
      if (currentUser.user_type == 1) {
        applications = await dataSources.database.applyAddIndustry.selectApplyAddIndustrys() || []
      } else {
        applications = await dataSources.database.applyAddIndustry.selectApplyAddIndustrysByUserId(currentUser.id) || []
      }
      response = {
        applications,
        isSuccess: true,
        extension: {
          operator: 'industryApply query',
          errors
        }
      }
    } else {
      errors.push({
        path: 'industryApply',
        message: 'auth fail'
      })
      response = {
        isSuccess: false,
        extension: {
          operator: "industryApply query",
          errors
        }
      }
    }
  } catch (err) {
    errors.push({
      path: 'industryApply',
      message: JSON.stringify(err)
    })

    response = {
      isSuccess: false,
      extension: {
        operator: "industryApply query",
        errors
      }
    }
  }
  return response
}

export default industryApply