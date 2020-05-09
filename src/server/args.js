const yargs = require('yargs');

const argv = yargs.option('port', {
  alias: 'p',
  default: 9000,
  describe: 'port',
}).option('host', {
  alias: 'h',
  default: '0.0.0.0',
  describe: 'host',
}).argv;

module.exports = argv;
