#!/usr/bin/env node

// requires
require('console.table')
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
  .option('-t, --tag <tag>', 'Tag')
  .parse(argv)

  var defaultDatabase = 'media'

  config.database = program.database || config.database || defaultDatabase
  var q = program.args[0] || ''

  params = {}
  params.q = q
  params.tag = program.tag

  qpm_media.search(params, config).then(function(ret){
    console.table(ret.ret[0])
    ret.conn.close()
  }).catch(function (err) {
    console.error(err)
  })


}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv)
}

module.exports = bin
