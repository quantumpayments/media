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

  var url     = process.argv[2] || 'https://localhost:4000/buffer?type=getLastFragment'
  var cert    = process.argv[3] || process.env['CERT']
  var display = process.argv[4] || process.env['DISP'] || 'display'
  var buffer  = process.argv[5] || 'https://localhost:4000/static/buffer.mp4'

  var options = {
    url: url,
    key: fs.readFileSync(cert),
    cert: fs.readFileSync(cert),
  }

  var config = require('../config/config.js')
  console.log(config);

  request.get(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body) // Show the HTML for the Google homepage.

      var cmd = display + ' ' + buffer
      console.log(cmd)
      child_process.exec(cmd)


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
