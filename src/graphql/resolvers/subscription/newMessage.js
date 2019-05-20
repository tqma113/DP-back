import { withFilter } from 'apollo-server';
import getPubSub from '../PubSub'
import { NEW_MESSAGE } from '../events'

const pubsub = getPubSub()

const newMessage = {
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
}

export default newMessage