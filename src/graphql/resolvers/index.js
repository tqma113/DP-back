import ScaleType from './ScaleType';
import Query from './Query';
import Mutation from './Mutation';
import Subscription from './Subscription';

const resolvers = {
  Query,
  Mutation,
  Subscription,
  
  Date: ScaleType.Date,
  JSON: ScaleType.JSON,
  JSONObject: ScaleType.JSONObject
};

export default resolvers;