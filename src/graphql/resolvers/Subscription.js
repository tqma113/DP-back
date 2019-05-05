import { PubSub, withFilter } from 'apollo-server';

import { NEW_MESSAGE } from './events'

const pubsub = new PubSub();

export default {
  newMessage: {
    resolve: (payload) => {
      console.log(payload)
      let response = {
        isSuccess: true,
        extension: {
          opeartor: 'messageSended',
          errors: []
        }
      }
      return response
    },
    subscribe: () => pubsub.asyncIterator([NEW_MESSAGE])
  }
}