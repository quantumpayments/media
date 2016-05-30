module.exports = handler

var debug = require('../debug').insert
var wc = require('webcredits')
var fs = require('fs')
var wc_db = require('wc_db')

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


  var config = require('../../config/config.js');
  var cost = 25
  var faucetURI = 'https://w3id.org/cc#faucet'

  var sequelize = wc_db.getConnection(config);
  wc.getBalance(source, sequelize, config, function(err, ret){
    if (err) {
      console.error(err);
    } else {
      console.log(ret);

      if (ret > cost) {

        var credit = {};

        credit["https://w3id.org/cc#source"] = req.session.userId
        credit["https://w3id.org/cc#amount"] = cost
        credit["https://w3id.org/cc#currency"] = 'https://w3id.org/cc#bit'
        credit["https://w3id.org/cc#destination"] = faucetURI


        wc.insert(credit, res.locals.sequelize, res.locals.config, function(err, ret) {
          if (err) {
            res.write(err);
          } else {
            var images = [
            './assets/image/8480323243_79c94b8479_b-620x620.jpg',
            './assets/image/Campo-Andaluz-Andalusian-Countryside.jpg',
            './assets/image/Dunnottar-Castle.jpg',
            './assets/image/Solitude-in-the-Olympics1.jpg',
            './assets/image/Somewhere-in-Romania.jpg',
            './assets/image/Valley-of-Ten-Peaks1.jpg'
            ]


            var index = Math.floor(Math.random() * 6)
            var img = fs.readFileSync(images[index])
            res.writeHead(200, {'Content-Type': 'image/gif' });
            res.end(img, 'binary');
          }

        });


      } else {
        res.statusCode = 402;
        res.send('HTTP 402!  This resource has paid access control!')
      }


    }
    sequelize.close();
  });


}
