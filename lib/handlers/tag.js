module.exports = handler

var debug      = require('debug')('qpm_media:tag')
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


  var config  = res.locals.config
  var conn    = res.locals.sequelize
  var tag     = req.body.tag
  var addtag  = req.body.addtag
  var tagname = req.body.tagname
  var uri     = req.body.uri
  var params  = {}
  params.reviewer = req.session.userId
  params.limit    = 10

  if (addtag && addtag !== '') {
    params.tag = addtag
    qpm_media.addTag(params, config, conn).then(function(ret) {
      debug(ret.ret)
      res.render('pages/media/tag_success', { ui : config.ui })
    }).catch(function (err) {
      debug(err)
      res.render('pages/media/tag_error', { ui : config.ui })
    })
  } else if (uri && tagname){
    params.tag = tagname
    params.uri = uri
    qpm_media.addMediaTag(params, config, conn).then(function(ret) {
      debug(ret.ret)
      res.render('pages/media/tag_success', { ui : config.ui })
    }).catch(function (err) {
      debug(err)
      res.render('pages/media/tag_error', { ui : config.ui })
    })
  } else {
    qpm_media.getTags(params, config, conn).then(function(ret) {
      debug(ret)
      var array = ret.ret[0]
      var tags = []
      for (var i = 0; i < array.length; i++) {
        tags.push({"tag" : array[i].tag, "id" : array[i].id })
      }
      config.ui.tags = tags
      res.render('pages/media/tag', { ui : config.ui })
    }).catch(function(err) {
      debug(err)
      res.render('pages/media/tag', { ui : config.ui })
    })
  }





}
