

const categorys = async (root, { }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []
  try {
    let categorys = await dataSources.database.category.selectCategory()
    categorys = categorys.map(async item => {
      item.users = await dataSources.database.userCategory.selectUserCategorysByCategoryId(item.id)
      return item
    })
    response = {
      categorys,
      isSuccess: true,
      extension: {
        operator: 'categorys query',
        errors
      }
    }
  } catch (err) {
    errors.push({
      path: 'categorys',
      message: JSON.stringify(err)
    })

    response = {
      isSuccess: false,
      categorys: [],
      extension: {
        operator: "categorys query",
        errors
      }
    }
  }
  return response
}

export default categorys