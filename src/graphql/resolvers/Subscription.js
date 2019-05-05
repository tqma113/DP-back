import { withFilter } from 'apollo-server';
import getPubSub from './PubSub'
import { NEW_MESSAGE } from './events'

const pubsub = getPubSub()

export default {
  newMessage: {
    resolve: (payload) => {
      console.log(payload)
      let response = {
        isSuccess: true,
        extension: {
          operator: 'messageSended',
          errors: []
        }
      }
      return response
    },
    subscribe: withFilter(
      () => pubsub.asyncIterator([NEW_MESSAGE]),
      (payload, variables) => {
        console.log(payload, variables)
        return true;
      },
    )
  },

}