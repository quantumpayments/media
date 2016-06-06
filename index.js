module.exports = require('./lib/qpm_media')
module.exports.handlers = {
  addMedia : require('./lib/handlers/addmedia'),
  random : require('./lib/handlers/random')
}
