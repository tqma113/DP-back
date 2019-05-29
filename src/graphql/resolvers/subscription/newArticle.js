import { withFilter } from 'apollo-server';
import getPubSub from '../PubSub'
import { NEW_ARTICLE } from '../events'

const pubsub = getPubSub()

const newArticle = {
  resolve: (payload) => {
    let response = payload
    return response
  },
  subscribe: withFilter(
    () => pubsub.asyncIterator([NEW_ARTICLE]),
    (payload, variables, { currentUser, sessionInfo }, websocket) => {
      return currentUser && 
      sessionInfo && 
      payload && 
      payload.id &&
      payload.user_id &&
      payload.categorys &&
      payload.industrys &&
      (
        currentUser.concerned.some(item => Number(item.concerned_user_id) === Number(payload.user_id)) ||
        currentUser.categorys.some(item => payload.categorys.some(i => Number(i) === Number(item))) ||
        currentUser.industrys.some(item => payload.industrys.some(i => Number(i) === Number(item)))
      )
    },
  )
}

export default newArticle