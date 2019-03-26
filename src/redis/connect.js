import redis from 'redis';
import assert from 'assert'

const client = redis.createClient()

client.on('ready', function () {
  console.log('Redis connected!')
})

client.on('error', function (err) {
  assert(err instanceof Error);
  assert(err instanceof redis.AbortError);
  assert(err instanceof redis.AggregateError);
  // The set and get get aggregated in here
  assert.strictEqual(err.errors.length, 2);
  assert.strictEqual(err.code, 'NR_CLOSED');
});

export default client