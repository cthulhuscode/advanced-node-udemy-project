const { clearHash } = require("../services/cache");

module.exports = async (req, res, next) => {
  /*
    **Nice trick**
    Let the route handler do whatever it needs to do,
    wait until it finishes. Then come back and execute 
    the rest of the code. 
  */
  await next();

  clearHash(req.user.id);
};
