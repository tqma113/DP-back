import ScaleType from './Scale/index';
import Query from './Query/index';
import Mutation from './Mutation/index';
import Subscription from './Subscription/index';

const resolvers = {
  Query,
  Mutation,
  Subscription,
  
  Date: ScaleType.Date,
  JSON: ScaleType.JSON,
  JSONObject: ScaleType.JSONObject
};

export default resolvers;