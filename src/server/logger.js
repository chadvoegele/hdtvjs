const winston = require('winston');

const M = module.exports = {};

M.logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.logstash(),
  ),
  transports: [
    new winston.transports.Console(),
  ],
});
