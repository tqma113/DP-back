

const articleReport = async (root, { userId }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = !!sessionInfo && currentUser && currentUser.user_type == 1

    if (isValid) {
      let reports = await dataSources.database.articleReport.selectArticleReports()
      response = {
        reports,
        isSuccess: true,
        extension: {
          operator: 'articleReport',
          errors
        }
      }
    } else {
      if (!sessionInfo || !currentUser) {
        errors.push({
          path: 'articleReport',
          message: 'auth fail'
        })
      }

      if (currentUser.user_type != 1) {
        errors.push({
          path: 'articleReport',
          message: 'you have no permission'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'articleReport',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'articleReport',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: 'articleReport',
        errors
      }
    }
  }

  return response
}

export default articleReport