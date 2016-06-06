module.exports = handler

var debug     = require('debug')('qpm_media:rate')
var qpm_ui    = require('qpm_ui')
var qpm_media = require('../../')
var wc_db     = require('wc_db')

/**
 * Rating hander.
 * @param  {Object} req The request.
 * @param  {Object} res The response.
 */
function handler(req, res) {

  var origin = req.headers.origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  var rating = {}
  rating.uri      = req.body.uri
  rating.rating   = req.body.rating
  rating.reviewer = req.session.userId
  debug(rating)

  if (!rating.reviewer) {
    res.send('must be authenticated')
    return
  }

  config = res.locals.config
  conn   = res.locals.sequelize

  if (isNaN(rating.rating) || !rating.uri) {
    res.status(200)
    res.header('Content-Type', 'text/html')
    res.render('pages/media/rate_input', { ui : config.ui })
    return
  } else {
    qpm_media.addRating(rating, config, conn).then(function(ret) {
      res.status(200)
      res.header('Content-Type', 'text/html')
      res.render('pages/media/rate_success', { ui : config.ui })
      debug(ret)
      return
    }).catch(function(err){
      res.status(200)
      res.header('Content-Type', 'text/html')
      res.render('pages/media/rate_error', { ui : config.ui })
      debug(ret)
      return
    })
  }


}
