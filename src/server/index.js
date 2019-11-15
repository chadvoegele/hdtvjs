const express = require('express');
const control = require('./control');
const tv = require('./tv');
const remote = require('./remote');

const app = express();

app.get('/healthcheck', function(req, res) {
  res.send('OK');
});

app.use('/control', control.router);

app.use('/tv', tv.router);

app.use('/', remote.router);

app.listen(9000);
