module.exports = handler

var debug = require('debug')('qpm_media:random')
var fs = require('fs')
var qpm_media = require('../../')
var Negotiator = require('negotiator')
var wc = require('webcredits')
var wc_db = require('wc_db')
var qpm_ui = require('qpm_ui');

function handler(req, res) {

  var origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  var defaultCurrency = res.locals.config.currency || 'https://w3id.org/cc#bit';

  var source      = req.body.source;
  var destination = req.body.destination;
  var currency    = req.body.currency || defaultCurrency;
  var amount      = req.body.amount;
  var timestamp   = null;
  var description = req.body.description;
  var context     = req.body.context;




  if (!req.session.userId) {
    res.send('must be authenticated')
    return
  }

  var source      = req.session.userId

  if (!req.session.userId) {
    res.send('must be authenticated')
    return
  }


  var config = res.locals.config
  var conn   = res.locals.sequelize
  var params = {}
  params.reviewer = req.session.userId
  params.limit    = 10

  qpm_media.getTopImages(params, config, conn).then(function(ret) {
    console.log(ret.ret)
    var array = ret.ret[0]
    var top = []
    for (var i = 0; i < array.length; i++) {
      top.push({"uri" : array[i].uri, "rating" : array[i].rating })
    }
    config.ui.top = top
    params.reviewer = null
    return qpm_media.getTopImages(params, config, conn)
  }).then(function(ret) {
    console.log(ret.ret)
    var array = ret.ret[0]
    var top = []
    for (var i = 0; i < array.length; i++) {
      top.push({"uri" : array[i].uri, "rating" : array[i].rating })
    }
    config.ui.global = top

    res.render('pages/media/top', { ui : config.ui })
  }).catch(function(err) {
    console.log(err)
    res.render('pages/media/top', { ui : config.ui })
  })


}
