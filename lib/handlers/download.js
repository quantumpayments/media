module.exports = handler

var debug      = require('debug')('qpm_media:download')
var fs         = require('fs')
var path       = require('path')
var Negotiator = require('negotiator')
var qpm_media  = require('../../')
var qpm_ui     = require('qpm_ui');
var wc         = require('webcredits')
var wc_db      = require('wc_db')

function handler(req, res) {

  var origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  var source      = req.session.userId

  if (!req.session.userId) {
    res.send('must be authenticated')
    return
  }

  debug(req.path)

  var loc
  if (req.path == '/download/buffer.mp4') {
    res.header('Content-Type', 'video/mpeg')
    loc = path.join(__dirname, '../../public/buffer.mp4')
    res.download(loc)
  } else {
    loc = path.join(__dirname, '../../public/index.html')
    res.sendFile(loc)
  }


  //var filestream = fs.createReadStream(loc);
  // filestream.pipe(res);

  debug('reading : ' + loc)


  return


}
