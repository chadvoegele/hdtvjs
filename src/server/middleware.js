const {logger} = require('./logger');

const M = module.exports = {};

M.setNoCache = (req, res, next) => {
  res.header('Cache-Control', 'no-store');
  next();
};

M.logReq = function(req, res, next) {
  logger.debug({'message': 'requesting url', 'url': req.url});
  next();
};
