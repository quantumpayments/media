module.exports = require('./lib/qpm_media')
module.exports.handlers = {
  addMedia : require('./lib/handlers/addmedia'),
  random : require('./lib/handlers/random'),
  random_rate : require('./lib/handlers/random_rate'),
  random_rate_audio : require('./lib/handlers/random_rate_audio'),
  rate : require('./lib/handlers/rate'),
  top : require('./lib/handlers/search'),
  tag : require('./lib/handlers/tag'),
  top : require('./lib/handlers/top')
}
