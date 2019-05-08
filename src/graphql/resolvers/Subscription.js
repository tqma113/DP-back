import { withFilter } from 'apollo-server';
import getPubSub from './PubSub'
import { NEW_MESSAGE, NEW_USER_LOGIN, NEW_ARTICLE } from './events'

const pubsub = getPubSub()

export default {
  newMessage: {
    resolve: (payload) => {
      let response = payload
      return response
    },
    subscribe: withFilter(
      () => pubsub.asyncIterator([NEW_MESSAGE]),
      (payload, variables, { currentUser, sessionInfo }, websocket) => {
        return currentUser && sessionInfo && payload && payload.a_user_id && payload.a_user_id == currentUser.id
      },
    )
  },
  newUserLogin: {
    resolve: (payload) => {
      let response = payload
      return response
    },
    subscribe: withFilter(
      () => pubsub.asyncIterator([NEW_USER_LOGIN]),
      (payload, variables, { currentUser, sessionInfo }, websocket) => {
        return currentUser && 
        sessionInfo && 
        payload && 
        payload.id && 
        currentUser.concerned && 
        currentUser.concerned.some(item => Number(item.concerned_user_id) === Number(payload.id))
      },
    )
  },
  userLogout: {
    resolve: (payload) => {
      let response = payload
      return response
    },
    subscribe: withFilter(
      () => pubsub.asyncIterator([NEW_USER_LOGIN]),
      (payload, variables, { currentUser, sessionInfo }, websocket) => {
        return currentUser && 
        sessionInfo && 
        payload && 
        payload.id && 
        currentUser.concerned && 
        currentUser.concerned.some(item => Number(item.concerned_user_id) === Number(payload.id))
      },
    )
  },
  newArticle: {
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
        (
          currentUser.concerned.some(item => Number(item.concerned_user_id) === Number(payload.user_id)) ||
          currentUser.categorys.some(item => payload.categorys.some(i => Number(i) === Number(item)))
        )
      },
    )
  }
}