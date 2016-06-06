#!/usr/bin/env node

// requires
var fs         = require('fs')
var program    = require('commander')
var wc_db      = require('wc_db')
var qpm_media  = require('../')


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


  var defaultDatabase = 'webcredits'

  config.database = program.database || config.database || defaultDatabase

  var rating = {}
  rating.uri = program.args[0]
  rating.rating = program.args[1]
  rating.reviewer = program.args[2]


  if (!rating.uri || rating.uri === '') {
    console.error('You must enter a valid uri')
    return
  }

  if (isNaN(rating.rating)) {
    console.error('You must enter a rating')
    return

  }
  if (!rating.reviewer || rating.reviewer === '') {
    console.error('You must enter a valid reviewer')
    return
  }


  // Usage
  var i = 0;
  qpm_media.addRating(rating).then(function(res) {
    console.log(res)
  }).catch(function(err){
    console.error(err)
  })




}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv)
}

module.exports = bin
