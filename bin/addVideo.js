#!/usr/bin/env node

// requires
var exec = require('child_process').exec
var program = require('commander')
var qpmMedia = require('../')

var fileProtocol = 'file://'

/**
 * version as a command
 */
function bin (argv) {
  // setup config
  var config = require('../config/config.js')

  program
    .option('-d, --database <database>', 'Database')
    .option('-s, --safe     <safe>', 'Safe')
    .parse(argv)

  var defaultDatabase = 'media'

  config.database = program.database || config.database || defaultDatabase
  var mediaURI = process.argv[2]
  var safe = program.safe || 0

  if (!mediaURI) {
    console.error('Please supply a media URI')
  }

  if (/^\//.test(mediaURI)) {
    mediaURI = fileProtocol + mediaURI
  }

  qpmMedia.addMedia(mediaURI, null, safe).then(function (ret) {
    if (ret.conn) {
      ret.conn.close()
    }
    if (ret.ret) {
      console.log(ret.ret)
    }

    if (/^file:/.test(mediaURI)) {
      console.log('mediaURI', mediaURI)
      exec('./bin/getlength.sh "' + mediaURI + '"', function (err, stdout, stderr) {
        console.log('run getlength.sh', err, stdout, stderr)
        if (err) {
          console.error(err)
        } else {
          console.log(stdout)
          if (stdout && !isNaN(parseInt(stdout))) {
            var length = parseInt(stdout)
            console.log('length', length)
            var params = {}
            params.uri = mediaURI
            params.length = length
            qpmMedia.addMeta(params).then(function (ret) {
              if (ret && ret.conn && ret.conn.close) {
                ret.conn.close()
              }
            }).catch(function (err) {
              console.error(err)
            })
          }
        }
      })
    }
  }).then(function (ret) {
    console.log('added')
  }).catch(function (err) {
    console.error(err)
  })
}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv)
}

module.exports = bin
