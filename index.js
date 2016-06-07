module.exports = require('./lib/qpm_media')
module.exports.handlers = {
  addMedia : require('./lib/handlers/addmedia'),
  random : require('./lib/handlers/random'),
  random_rate : require('./lib/handlers/random_rate'),
  rate : require('./lib/handlers/rate'),
  tag : require('./lib/handlers/tag'),
  top : require('./lib/handlers/top')
}
