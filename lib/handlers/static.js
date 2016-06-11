module.exports = handler

var debug      = require('debug')('qpm_media:static')
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
  if (req.path == '/static/buffer.mp4') {
    loc = path.join(__dirname, '../../public/buffer.mp4')
  } else {
    loc = path.join(__dirname, '../../public/index.html')
  }

  debug('reading : ' + loc)
  res.sendFile(loc)


  return


}
