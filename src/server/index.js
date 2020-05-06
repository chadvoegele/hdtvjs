const express = require('express');
const control = require('./control');
const screen = require('./screen');
const remote = require('./remote');

const app = express();

app.get('/healthcheck', function(req, res) {
  res.send('OK');
});

app.use('/control', control.router);

app.use('/screen', screen.router);

app.use('/', remote.router);

app.listen(9000);
