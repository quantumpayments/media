#!/usr/bin/env node

// requires
var fs         = require('fs')
var program    = require('commander')
var wc_db      = require('wc_db')
var qpm_media  = require('../')
var solidbot   = require('solidbot');

/**
 * version as a command
 */
function bin(argv) {
  // setup config
  var config = require('../config/config.js')

  program
  .option('-d, --database <database>', 'Database')
  .option('-s, --safe     <safe>', 'Safe')
  .parse(argv)

  var defaultDatabase = 'media'

  config.database = program.database || config.database || defaultDatabase
  var mediaURI    = process.argv[2]
  var safe = program.safe || 0

  if (!mediaURI) {
    console.error('Please supply a media URI')
  }

  qpm_media.addMedia(mediaURI, null, safe).then(function(ret) {
    if (ret.conn) {
      ret.conn.close()
    }
    if (ret.ret) {
      console.log(ret.ret)
    }
  }).catch(function(err) {
    console.error(err)
  })

}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv)
}

module.exports = bin
