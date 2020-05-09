const express = require('express');
const args = require('./args');
const control = require('./control');
const remote = require('./remote');
const screen = require('./screen');

const app = express();

app.get('/healthcheck', function(req, res) {
  res.send('OK');
});

app.use('/control', control.router);

app.use('/screen', screen.router);

app.use('/', remote.router);

app.listen(args.port, args.host);
