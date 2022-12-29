/* Modify the Query exec function, to be able
  to use our caching strategy in any part where we use 
  a Mongoose Model.
  Store an index of that query and cache its data.  
*/

const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");

let client = redis.createClient({
  socket: {
    host: "localhost",
    port: 49153,
  },
  password: "redispw",
  legacyMode: true,
});

(async () => {
  await client.connect();
})();

// Overwrite and promisify client.get()
client.hget = util.promisify(client.hget);

/* Create a cache function, to cache data only when calling
  that function in a query.


*/
mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");

  // Just for making it chainable
  return this;
};

// Get a reference to the original exec function
const exec = mongoose.Query.prototype.exec;
mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) return exec.apply(this, arguments);

  // Safely copy properties from one object to another
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  // See if we have a value for 'key' in Redis
  const cachedValue = await client.hget(this.hashKey, key);

  // If we do, return that
  if (cachedValue) {
    const doc = JSON.parse(cachedValue);

    // Hydrate the values
    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }

  /*
    Otherwise, issue the query and store the result in Redis

    Use the unmodified exec function.
    Use apply to pass any arguments that are
    passed to exec. 
  */
  const result = (await exec.apply(this, arguments)) || "";

  // Store data in Redis
  if (result && result !== "")
    client.hset(this.hashKey, key, JSON.stringify(result), "EX", 10); // 10seg

  return result;
};

/* export function to clear hash */
module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
