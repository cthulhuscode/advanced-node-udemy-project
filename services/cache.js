/* Modify the Query exec function, to be able
  to use our caching strategy in any part where we use 
  a Mongoose Model.
  Store an index of that query and cache its data.  
*/

const mongoose = require("mongoose");
// const redis = require("redis");
// const util = require("util");

// let client = redis.createClient({
//   socket: {
//     host: "localhost",
//     port: 49154,
//   },
//   password: "redispw",
// });

// (async () => {
//   await client.connect();
// })();

// // Overwrite and promisify client.get()
// client.get = util.promisify(client.get);

// Get a reference to the original exec function
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function () {
  // Safely copy properties from one object to another
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  // See if we have a value for 'key' in Redis
  // const cachedValues = await client.get(key);

  // // If we do, return that
  // if (cachedValues) {
  //   console.log(cachedValues);
  // }

  /* 
      Otherwise, issue the query and store the result in Redis
  
      Use the unmodified exec function. 
      Use apply to pass any arguments that are
      passed to exec. 
    */
  const result = await exec.apply(this, arguments);
  return result;
};
