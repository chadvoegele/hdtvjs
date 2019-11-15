const control = require('./control');
const express = require('express');
const hdhr = require('./hdhr');
const middleware = require('./middleware');
const {logger} = require('./logger');

const M = module.exports = {};

M.router = express.Router();

const getGuideForOneChannel = function(guide, number) {
  if (!guide) {
    return null;
  }
  const guideFilter = guide.filter(function(g) {
    return g.GuideNumber == number;
  });
  if (guideFilter.length !== 1) {
    logger.info(`no matching guide found for number ${number}`);
    return null;
  };
  return guideFilter[0];
};

const getGuideHTMLForOneChannel = function(guideForOneChannel) {
  if (!guideForOneChannel) {
    return '';
  }
  const sortedGuide = guideForOneChannel.Guide.sort(function(a, b) {
    return a.StartTime - b.StartTime;
  });
  if (sortedGuide.length === 0) {
    return '';
  }
  const guideEntry = sortedGuide[0];
  let html = `${guideEntry.Title.substring(0, 40)}`;
  if (guideEntry.EpisodeTitle) {
    html = html + ` - ${guideEntry.EpisodeTitle.substring(0, 40)}`;
  }
  return html;
};

M.router.get('/', middleware.logReq, middleware.setNoCache, async function(req, res) {
  try {
    const controlStatus = control.getStatus();
    if (controlStatus.isStreaming) {
      logger.debug('Currently streaming. Creating stop stream page.');
      const stopStream = `<a href='/control/stop'>Stop stream</a>`;
      const urlPage = `Currently streaming: <a href='/tv'>${controlStatus.url}</a>`;
      const innerPage = `<table><tr><td>${stopStream}</td></tr><tr><td>${urlPage}</td></tr></table>`;
      const page = `<html><body>${innerPage}</body></html>`;
      res.send(page);
      return;
    }

    logger.debug('Not currently streaming. Creating lineup and guide page.');
    const lineup = await hdhr.getLineup();
    let guide;
    try {
      guide = await hdhr.getGuide();
    } catch (e) {
      logger.error(`error getting guide ${e}`);
      guide = null;
    }
    const pageItems = lineup.map((item) => {
      const number = `${item.GuideNumber}`;
      const name = `${item.GuideName}`;
      const url = `<a href='/control/start?url=${encodeURIComponent(item.URL)}'>${item.URL}</a>`;
      const guideForOneChannel = getGuideForOneChannel(guide, number);
      const guideHTML = getGuideHTMLForOneChannel(guideForOneChannel);
      return `<tr><td>${number}</td><td>${name}</td><td>${url}</td><td>${guideHTML}</td></tr>`;
    }).join('\n');
    const innerPage = `<table>${pageItems}</table>`;
    const page = `<html><body>${innerPage}</body></html>`;
    logger.debug(`sending remote page with length ${page.length}`);
    res.send(page);
  } catch (e) {
    logger.error(`sending remote error page Error: ${e.toString()}`);
    res.send(`<html><body>Error: ${e.toString()}</body></html>`);
  }
});
