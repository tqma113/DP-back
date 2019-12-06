import ScaleType from './scale/index';
import Query from './query/index';
import Mutation from './mutation/index';
import Subscription from './subscription/index';

const resolvers = {
  Query,
  Mutation,
  Subscription,
  
  Date: ScaleType.Date,
  JSON: ScaleType.JSON,
  JSONObject: ScaleType.JSONObject
};

export default resolvers;