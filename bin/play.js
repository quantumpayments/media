#!/usr/bin/env node

// requires
var child_process = require('child_process')
var fs            = require('fs')
var program       = require('commander')
var qpm_media     = require('../')
var request       = require('request')

/**
* version as a command
*/
function bin(argv) {
  // setup config


  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

  var url     = process.argv[2] || 'https://localhost:4000/random_rate?type=getLastFragment'
  var cert    = process.argv[3] || process.env['CERT']
  var display = process.argv[4] || process.env['DISP'] || 'display'

  var options = {
    url: url,
    key: fs.readFileSync(cert),
    cert: fs.readFileSync(cert),
    headers: { //We can define headers too
      'Accept': 'application/json'
    }
  }

  var config = require('../config/config.js')
  console.log(config);

  request.get(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body) // Show the HTML for the Google homepage.
      json = JSON.parse(body)
      var uri = json.uri
      var cacheURI = json.cacheURI
      var displayURI = cacheURI || uri
      var start = json.end || 0
      var duration = 15
      var end = start + duration
      console.log(json.rating)
      console.log(displayURI)

      var cmd = display + ' "' + displayURI + '" --start-time ' + start + ' --stop-time ' + end
      console.log(cmd)
      child_process.exec(cmd)
      // main
      var params = {}
      params.uri = uri
      params.id = json.id
      params.start = start
      params.end = end

      qpm_media.addFragment(params, config).then(function(ret) {
        if (ret.conn) {
          var conn = ret.conn
          conn.close()
        }
        console.log(ret.ret)
      }).catch(function(err){
        if (err.conn) {
          var conn = err.conn
          conn.close()
        }
        console.error(err.err)
      })


    } else {
      console.error(error);
    }

  })
}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv)
}

module.exports = bin
