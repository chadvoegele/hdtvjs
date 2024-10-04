const childProcess = require('child_process');
const express = require('express');
const fs = require('fs');
const middleware = require('./middleware');
const {logger} = require('./logger');

const M = module.exports = {};

M.SERVE_DIR = `/tmp/streams_wwwroot`;

const STOP_DELAY = 60000;

let state = {};

const resetState = function() {
  logger.debug(`control clearing stop timeout in reset state ${state.stopStreamTimeout}`);
  state.stopStreamTimeout && clearTimeout(state.stopStreamTimeout);
  state = {
    isStreaming: false,
    hlsProcess: null,
    url: null,
    stopStreamTimeout: null,
  };
};

M.getStatus = function() {
  return {
    isStreaming: state.isStreaming,
    url: state.url,
  };
};

M.prepareDirectory = async function() {
  if (fs.existsSync(M.SERVE_DIR)) {
    logger.debug(`Removing recursive ${M.SERVE_DIR}`);
    await fs.promises.rmdir(M.SERVE_DIR, {recursive: true});
  }
  logger.debug(`making ${M.SERVE_DIR}`);
  await fs.promises.mkdir(M.SERVE_DIR);
};

M.startStream = async function(url) {
  if (state.isStreaming) {
    logger.error('Requested to start stream but there is already a stream running!');
    throw new Error('There is already a stream running!');
  }

  logger.debug(`control starting stream`);
  await M.prepareDirectory();

  const streamsRoot = ``;
  const hlsCommand = `ffmpeg`;
  const hlsCommandArgs = [
    `-re`, `-i`, `${url}`, `-c:v`, `copy`, `-c:a`, `mp3`,
    `-hls_segment_filename`, `${M.SERVE_DIR}/stream%03d.ts`,
    `-hls_base_url`, `${streamsRoot}`,
    `-hls_time`, `2`,
    `-hls_list_size`, `10`,
    `-hls_flags`, `delete_segments`,
    `${M.SERVE_DIR}/stream.m3u8`,
  ];
  logger.debug(`spawning ${hlsCommand} with args ${hlsCommandArgs.join(' ')}`);
  const hlsProcess = childProcess.spawn(hlsCommand, hlsCommandArgs);
  hlsProcess.on('error', (code) => {
    logger.error(`hlsProcess had an error! code=${code}`);
    throw new Error(code);
  });
  hlsProcess.on('exit', (code) => {
    logger.info(`hls process exiting ${code}`);
    resetState();
  });
  hlsProcess.stdout.on('data', (data) => {
    logger.info({message: 'hls process stdout', data: data.toString()});
  });
  hlsProcess.stderr.on('data', (data) => {
    logger.info({message: 'hls process stderr', data: data.toString()});
  });

  state.hlsProcess = hlsProcess;
  state.isStreaming = true;
  state.url = url;

  M.extendStopTimeout();
};

M.extendStopTimeout = function() {
  logger.debug(`control extending stop timeout ${state.stopStreamTimeout}`);
  state.stopStreamTimeout && clearTimeout(state.stopStreamTimeout);
  state.stopStreamTimeout = setTimeout(() => {
    logger.info('control stopping stream from timeout');
    M.stopStream();
  }, STOP_DELAY);
};

M.stopStream = async function() {
  logger.debug(`control stopping stream`);
  if (!state.isStreaming) {
    logger.error('control trying to stop stream but there is no stream to stop');
    throw new Error('There is no stream to stop!');
  }
  state.hlsProcess.kill();
  await M.prepareDirectory();
  resetState();
};

M.router = express.Router();

M.router.get('/start', middleware.logReq, async function(req, res) {
  const url = req.query.url + '?transcode=mobile';
  M.startStream(url);
  res.redirect('../screen');
});

M.router.get('/stop', middleware.logReq, async function(req, res) {
  M.stopStream();
  res.redirect('../');
});
