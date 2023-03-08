jest.setTimeout(30000); // 30 seg

require("../models/User");

const mongoose = require("mongoose");
const keys = require("../config/keys");

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);

afterAll(() => {
  return mongoose.connection.close();
});
