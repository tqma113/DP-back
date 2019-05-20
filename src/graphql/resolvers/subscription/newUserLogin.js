import { withFilter } from 'apollo-server';
import getPubSub from '../PubSub'
import { NEW_USER_LOGIN } from '../events'

const pubsub = getPubSub()

const newUserLogin = {
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
}

export default newUserLogin