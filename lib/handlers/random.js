module.exports = handler

var debug      = require('../debug').insert
var fs         = require('fs')
var Negotiator = require('negotiator')
var qpm_media  = require('../../')
var wc_db      = require('wc_db')
var wc         = require('webcredits')

function handler(req, res) {

  var availableMediaTypes = ['text/html', 'text/plain', 'application/json']

  var origin = req.headers.origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  var defaultCurrency = res.locals.config.currency || 'https://w3id.org/cc#bit'

  var source      = req.body.source
  var destination = req.body.destination
  var currency    = req.body.currency || defaultCurrency
  var amount      = req.body.amount
  var timestamp   = null
  var description = req.body.description
  var context     = req.body.context


  var source      = req.session.userId

  if (!req.session.userId) {
    res.send('Must be authenticated via WebID.  Get a webid <a href="https://databox.me/">NOW</a>!')
    return
  }

  var faucetURI = 'https://w3id.org/cc#faucet'

  var config = require('../../config/config.js')

  var sequelize = wc_db.getConnection(config.db)
  qpm_media.getRandomImage(function(err, ret){
    if (err) {
      console.error(err)
    } else {
      console.log(ret)

      var negotiator = new Negotiator(req)
      var mediaType = negotiator.mediaType(availableMediaTypes)
      console.log(mediaType)

      if (ret === null) {
        ret = 0
      }
      var image = ret[0][0].uri
      res.status(200)
      res.header('Content-Type', mediaType)
      if (mediaType === 'text/html') {
        res.write('<img src="'+image+'">')
        res.write('<br>\n')
        res.write('Image courtesy of perfect loops, refresh for new image.\n')
        res.end()
      } else if ( mediaType === 'application/json' ) {
        res.write('{ "image" : "'+image+'"}')
        res.end()
      } else if ( mediaType === 'text/plain' ) {
        res.write(image)
        res.end()
      }
    }
    sequelize.close()
  })


}
