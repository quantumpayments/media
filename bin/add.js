#!/usr/bin/env node

// requires
var fs         = require('fs')
var program    = require('commander')
var wc_db      = require('wc_db')
var Q          = require("q");
var qpm_media  = require('../')
var qpm_queue  = require('qpm_queue')


/**
 * version as a command
 */
function bin(argv) {
  // setup config
  var config = require('../config/config.js')



  program
  .arguments('<uri> [uris...]')
  .option('-d, --database <database>', 'Database')
  .parse(argv)


  var defaultDatabase = 'media'

  config.database = program.database || config.database || defaultDatabase

  var uris = program.args;
  if (!uris || uris.length === 0) {
    return 'You must enter a valid uri'
  }

  // Usage
  var i = 0;
  qpm_queue.promiseWhile(function () { return i < uris.length }, function () {
    qpm_media.addMedia(uris[i]).then(function(res) {
      console.log(res)
    }).catch(function(err){
      console.error(err)
    })

    console.log(i);
    i++;
    return Q.delay(1000); // arbitrary async
  }).then(function () {
      console.log("done");
  }).done();



}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv)
}

module.exports = bin
