import { GraphQLScalarType } from 'graphql';
const { Kind } = require('graphql/language');
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';

export default {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value) {
      // 輸出到前端
      // 回傳 unix timestamp 值
      return value.getTime();
    },
    parseValue(value) {
      // 從前端 variables 進來的 input
      // 回傳 Date Object 到 Resolver
      return new Date(value);
    },
    parseLiteral(ast) {
      // 從前端 query 字串進來的 input
      // 這邊僅接受輸入進來的是 Int 值
      if (ast.kind === Kind.INT) {
        // 回傳 Date Object 到 Resolver (記得要先 parseInt)
        return new Date(parseInt(ast.value, 10)); // ast value is always in string format
      }
      return null;
    }
  }),
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject
}