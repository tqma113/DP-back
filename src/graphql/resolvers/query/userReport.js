

const userReport = async (root, { userId }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []

  try {
    let isValid = !!sessionInfo && currentUser && currentUser.user_type == 1

    if (isValid) {
      let reports = await dataSources.database.userReport.selectUserReports()
      reports = reports.map(async item => {
        item.user = (await dataSources.database.user.selectUserById(item.user_id))[0]
        item.reportUser = (await dataSources.database.user.selectUserById(item.report_user_id))[0]
        return item
      })
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

  return response
}

export default userReport