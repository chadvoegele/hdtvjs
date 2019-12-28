const request = require('request-promise-native');

const M = module.exports = {};

M.getLineup = async function() {
  const discoverUrl = 'http://ipv4-api.hdhomerun.com/discover';
  const discoverRes = await request(discoverUrl);
  const discover = JSON.parse(discoverRes);
  if (discover.length == 0) {
    throw new Error('Did not find any HDHR devices during discover!');
  };
  const lineupUrl = discover[0].LineupURL;
  const lineupRes = await request(lineupUrl);
  const lineup = JSON.parse(lineupRes);
  return lineup;
};

M.getGuide = async function() {
  const discoverUrlOptions = {
    uri: 'http://ipv4-api.hdhomerun.com/discover',
    headers: {
      'User-Agent': '',
    },
  };
  const discoverRes = await request(discoverUrlOptions);
  const discover = JSON.parse(discoverRes);
  if (discover.length == 0) {
    throw new Error('Did not find any HDHR devices during discover!');
  };
  const localDiscoverUrl = discover[0].DiscoverURL;
  const localDiscoverRes = await request(localDiscoverUrl);
  const localDiscover = JSON.parse(localDiscoverRes);
  const deviceAuth = localDiscover.DeviceAuth;
  const guideUrlOptions = {
    uri: `http://api.hdhomerun.com/api/guide.php?DeviceAuth=${deviceAuth}`,
    headers: {
      'User-Agent': '',
    },
  };
  const guideRes = await request(guideUrlOptions);
  const guide = JSON.parse(guideRes);
  return guide;
};
