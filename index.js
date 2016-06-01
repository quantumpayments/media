module.exports = require('./lib/qpm_media')
module.exports.createServer = require('./lib/create-server')
module.exports.handlers = { random : require('./lib/handlers/random') }
