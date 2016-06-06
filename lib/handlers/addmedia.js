module.exports = handler

var debug     = require('debug')('qpm_faucet:addcredits')
var fs        = require('fs')
var hdwallet  = require('qpm_hdwallet')
var qpm_ui    = require('qpm_ui')
var qpm_media = require('../../')
var wc_db     = require('wc_db')
var wc        = require('webcredits')


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


  var source      = req.session.userId

  if (!req.session.userId) {
    res.send('must be authenticated')
    return
  }

  var faucetURI = 'https://w3id.org/cc#faucet'

  config = res.locals.config

  var sequelize = wc_db.getConnection(config.db);
  wc.getBalance(faucetURI, sequelize, config, function(err, ret){
    if (err) {
      console.error(err);
    } else {
      console.log(ret);
      if (ret === null) {
        ret = 0
      }
      var payout = Math.floor(ret / 100.0)

      if (req.body.uri) {

        var credit = {};

        credit["https://w3id.org/cc#source"] = faucetURI
        credit["https://w3id.org/cc#amount"] = payout
        credit["https://w3id.org/cc#currency"] = 'https://w3id.org/cc#bit'
        credit["https://w3id.org/cc#destination"] = req.session.userId



        qpm_media.addMedia(req.body.uri).then(function(ret){
          res.status(200)
          res.header('Content-Type', 'text/html')

          ui.uri = req.body.uri
          res.render('pages/addmedia_success', { ui : config.ui })


        }).catch(function(err) {
          res.status(200)
          res.header('Content-Type', 'text/html')
          console.log('ERROR!!!');
          console.error(err)
          res.write(err.toString() + '\n')
          res.end()

        })





      } else {

        res.status(200)
        res.header('Content-Type', 'text/html')


        res.render('pages/addmedia_error', { ui : config.ui })


      }
    }
    sequelize.close();
  });


}
