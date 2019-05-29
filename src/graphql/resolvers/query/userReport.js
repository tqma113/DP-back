

const userReport = async (root, { userId }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = !!sessionInfo && currentUser && currentUser.user_type == 1

    if (isValid) {
      let reports = await dataSources.database.userReport.selectUserReports()
      response = {
        reports,
        isSuccess: true,
        extension: {
          operator: 'userReport',
          errors
        }
      }
    } else {
      if (!sessionInfo || !currentUser) {
        errors.push({
          path: 'userReport',
          message: 'auth fail'
        })
      }

      if (currentUser.user_type != 1) {
        errors.push({
          path: 'userReport',
          message: 'you have no permission'
        })
      }

      response = {
        isSuccess: false,
        extension: {
          operator: 'userReport',
          errors
        }
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'userReport',
      message: JSON.stringify(err)
    })
    response = {
      isSuccess: false,
      extension: {
        operator: 'userReport',
        errors
      }
    }
  }
  console.log(response)

  return response
}

export default userReport