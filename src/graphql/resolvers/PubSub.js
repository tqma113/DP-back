import { PubSub, withFilter } from 'apollo-server';

const pubsub = new PubSub()

const getPubSub = () => {
  return pubsub
}

export default getPubSub