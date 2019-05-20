

const init = async (root, { }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
  let response = {}
  let errors = []
  const queryAsync = async (i) => {
    i.industrys =  (await dataSources.database.userIndustry.selectUserIndustrysByUserId(i.id)).map(item => item.industry_id)
    i.eduBG = await dataSources.database.eduBG.selectEduBGsByUserId(i.id)
    i.emRecords = await dataSources.database.emRecord.selectEmRecordsByUserId(i.id)
    i.articles = await dataSources.database.article.selectArticlesByUserIds([i.id])
    i.categorys = (await dataSources.database.userCategory.selectUserCategorysByUserId(i.id)).map(item => item.category_id)
    i.concerned = await dataSources.database.userConcerned.selectUserConcernedsByUserId(i.id)
    i.concern = await dataSources.database.userConcerned.selectUserConcernedsByConcernedUserId(i.id)
    i.likes = await dataSources.database.articleLike.selectArticleLikesByUserId(i.id)
    i.collections = await dataSources.database.articleCollection.selectArticleCollectionsByUserId(i.id)
    i.dynamics = []
    return i
  }
  try {
    let isValid = !!sessionInfo && currentUser

    if (isValid) {
      let user = currentUser
      user = await queryAsync(user)

      response = {
        user,
        isSuccess: true,
        extension: {
          operator: 'checkLoginState',
          errors
        }
      }
    } else {
      errors.push({
        path: 'sendMessage',
        message: 'auth fail'
      })

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

export default init