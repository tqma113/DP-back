

const industrys = async (root, { }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []
  try {
    let industrys = await dataSources.database.industry.selectIndustry()
    industrys = industrys.map(async item => {
      item.users = await dataSources.database.userIndustry.selectUserIndustrysByIndustryId(item.id)
      return item
    })
    response = {
      industrys,
      isSuccess: true,
      extension: {
        operator: 'industrys query',
        errors
      }
    }
  } catch (err) {
    errors.push({
      path: 'industrys',
      message: JSON.stringify(err)
    })

    response = {
      isSuccess: false,
      industrys: [],
      extension: {
        operator: "industrys query",
        errors
      }
    }
  }
  return response
}

export default industrys