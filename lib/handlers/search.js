module.exports = handler

var debug      = require('debug')('qpm_media:top')
var qpm_media  = require('../../')


function handler(req, res) {

  var origin = req.headers.origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  var user = req.session.userId
  if (!user) {
    res.send('must be authenticated')
    return
  }


  var config = res.locals.config
  var conn   = res.locals.sequelize
  var params = {}
  params.reviewer = req.session.userId
  params.limit    = 10
  params.tag      = req.query.tag || 'tv'

  qpm_media.search(params, config, conn).then(function(ret) {
    var array = ret.ret[0]
    var top = []
    for (var i = 0; i < array.length; i++) {
      top.push({"uri" : array[i].uri, "rating" : array[i].rating })
    }
    config.ui.global = top

    res.render('pages/media/search', { ui : config.ui })
  }).catch(function(err) {
    config.ui.top = []
    config.ui.global = []
    debug(err)
    res.render('pages/media/search', { ui : config.ui })
  })


}
