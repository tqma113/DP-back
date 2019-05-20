

const users = async (root, { idList, usernames, categoryIds, industryIds }, { dataSources, res, req, currentUser, sessionInfo, errors: authErrors }, info) => {
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
    let users = []
    if (idList && idList.length && idList.length > 0) {
      users = await dataSources.database.user.selectUsersByIds(idList)
    } else if (usernames && usernames.length && usernames.length > 0) {
      users = await dataSources.database.user.selectUsersByUsernames(usernames)
    } else if (categoryIds && categoryIds.length && categoryIds.length > 0) {
      let userIds = (await dataSources.database.userCategory.selectUserCategorysByCategoryIds(categoryIds)).map(item => item.user_id)
      users = await dataSources.database.user.selectUsersByIds(userIds)
    } else if (industryIds && industryIds.length && industryIds.length > 0) {
      let userIds = (await dataSources.database.userIndustry.selectUserIndustrysByIndustryIds(industryIds)).map(item => item.user_id)
      users = await dataSources.database.user.selectUsersByIds(userIds)
    } else {
      users = await dataSources.database.user.selectUsers()
    }

    users = users.map(async i => queryAsync(i))
    
    response = {
      users,
      isSuccess: true,
      extension: {
        operator: 'users query',
        errors
      }
    }
  } catch (err) {
    console.log(err)
    errors.push({
      path: 'users',
      message: JSON.stringify(err)
    })

    response = {
      isSuccess: false,
      users: [],
      extension: {
        operator: "users query",
        errors
      }
    }
  }

  // console.log(response)
  return response
}

export default users