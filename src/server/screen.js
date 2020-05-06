const control = require('./control');
const express = require('express');
const middleware = require('./middleware');
const path = require('path');
const {logger} = require('./logger');

const M = module.exports = {};

M.router = express.Router();

M.router.get('/:hlsFile', middleware.logReq, middleware.setNoCache, (req, res) => {
  control.extendStopTimeout();
  const hlsFile = req.params.hlsFile;
  logger.debug(`tv sending file ${control.SERVE_DIR}/${hlsFile}`);
  res.sendFile(`${control.SERVE_DIR}/${hlsFile}`);
});

M.router.get('/', async function(req, res) {
  const controlStatus = control.getStatus();
  if (!controlStatus.isStreaming) {
    logger.debug('tv not currently streaming, redirecting to remote');
    res.redirect('/');
    return;
  }
  logger.debug('tv sending tv video');
  res.sendFile(path.join(__dirname, '../client/tv.html'));
});

