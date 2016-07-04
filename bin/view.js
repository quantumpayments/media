#!/usr/bin/env node

var debug         = require('debug')('qpm_media:view')
debug('begin qpm_media:view')

// requires
var child_process = require('child_process')
var cookie        = require('cookie')
var fs            = require('fs-extra')
var program       = require('commander')
var qpm_media     = require('../lib/qpm_media')
var request       = require('request')
var urlencode     = require('urlencode')
var webcredits    = require('webcredits')
var wc_db         = require('wc_db')


var workbot = 'https://workbot.databox.me/profile/card#me'
var cost    = 40


debug('requires loaded')


/**
* version as a command
*/
function bin(argv) {

  debug('start')

  // setup config
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

  var uri     = process.argv[2] || 'https://localhost:3000/random_rate'
  var cert    = process.argv[3] || process.env['CERT']
  var display = process.argv[4] || process.env['DISP'] || 'display'
  var mode    = process.argv[5] || 'buffer'
  var user    = process.argv[6] || 'http://melvincarvalho.com/#me'

  var config = require(__dirname + '/../config/config.js')

  getMedia(uri, cert, mode, user).then(function(row) {

    var uri = row.uri
    var cacheURI = row.cacheURI
    var displayURI = cacheURI || uri
    var cmd = display + ' ' + displayURI

    debug('cmd', cmd)
    debug('row', row)
    exec(cmd)
    var params = { cacheURI : cacheURI }
    updateLastSeen(params, config)

  }).catch(function(err){
    console.error(err)
  })

}


function balance(source, conn, config) {

  var config = require(__dirname + '/../config/config.js')
  debug('balance', config)
  var conn = wc_db.getConnection(config.db)

  return new Promise(function(resolve, reject) {
    webcredits.getBalance(source, conn, config, function(err,ret) {
      debug('balance', 'entered')
      if (err) {
        debug('err', err)
        reject(err)
      } else {
        debug('balance', ret)
        resolve(ret)
      }
    })
  })

}


function pay(credit, config, conn) {

  var config = require(__dirname + '/../config/config.js')
  debug('pay', config)
  var conn = wc_db.getConnection(config.db)

  return new Promise(function(resolve, reject) {
    webcredits.insert(credit, conn, config, function(err,ret) {
      if (err) {
        debug('pay', err)
      } else {
        debug('pay', ret.ret)
      }
    })
  })

}

/**
 * Get Media item
 * @param  {string} uri  The uri to get it from.
 * @param  {string} cert Location of an X.509 cert.
 * @param  {string} mode Mode api | http | buffer.
 * @param  {string} user The WebID of the user.
 * @return {object}      Promise with the row.
 */
function getMedia(uri, cert, mode, user) {

  return new Promise(function(resolve, reject) {

    if (mode === 'api') {

      balance(user).then((ret)=>{
        return ret
      }).then(function(ret){
        if (ret >= cost) {
          qpm_media.getRandomUnseenImage().then(function(row) {
            row.conn.close()
            resolve(row.ret[0][0])

            // pay
            var credit = {}
            credit['https://w3id.org/cc#source'] = user
            credit['https://w3id.org/cc#amount'] = cost
            credit['https://w3id.org/cc#currency'] = 'https://w3id.org/cc#bit'
            credit['https://w3id.org/cc#destination'] = workbot
            pay(credit)


          }).catch(function(err) {
            row.conn.close()
            reject(err)
          })
        } else {
          reject(new Error('not enough funds'))
        }
      })


    } else if (mode === 'buffer') {

      balance(user).then((ret)=>{
        return ret
      }).then(function(ret){
        if (ret >= cost) {


          var bufferPath = __dirname + '/../data/buffer/'
          var files = fs.readdirSync(bufferPath)
          if (files && files[0]) {
            var nextFile = __dirname + '/../data/buffer/' + files[0]
            var ret = { 'uri' : nextFile, 'cacheURI' : urlencode.decode(files[0]) }
            resolve(ret)
          } else {
            reject(new Error('nothing in buffer'))
          }

          setTimeout(() => {
            try {
              fs.unlinkSync(nextFile)
            } catch (e) {
              console.error(e)
            }
            qpm_media.getRandomUnseenImage().then(function(row) {
              debug('unseen', row.ret)
              var cacheURI = row.ret[0][0].cacheURI
              var filePath = cacheURI.substr('file://'.length)
              console.log('copying', filePath)

              fs.copy(filePath, bufferPath + urlencode(cacheURI), function (err) {
                if (err) {
                  console.error(err)
                } else {
                  console.log("success!")
                  // pay
                  var credit = {}
                  credit['https://w3id.org/cc#source'] = user
                  credit['https://w3id.org/cc#amount'] = cost
                  credit['https://w3id.org/cc#currency'] = 'https://w3id.org/cc#bit'
                  credit['https://w3id.org/cc#destination'] = workbot
                  pay(credit)

                  if (row && row.conn) {
                    row.conn.close()
                  }
                }

              })

            })

          }, 1000)



        } else {
          reject(new Error('not enough funds'))
        }
      })




    } else if (mode === 'http') {

      var cookiePath = __dirname + '/../data/cookie.json'

      var cookies = readCookie(cookiePath)

      if (cookies) {
        options.headers['Set-Cookie'] = 'connect.sid=' + sid + '; Path=/; HttpOnly; Secure'
      }


      var options = {
        url: uri,
        key: fs.readFileSync(cert),
        cert: fs.readFileSync(cert),
        headers: { //We can define headers too
          'Accept': 'application/json',
        }
      }

      request.get(options, function (error, response, body) {

        writeCookie(response, cookiePath)

        if (!error && response.statusCode == 200) {

          json = JSON.parse(body)
          resolve(json)

        } else {
          reject(error);
        }

      })

    }

  })

}


/**
 * Execute a command
 * @param  {string} cmd Command as a string.
 */
function exec(cmd) {
  debug('executing cmd', cmd)
  child_process.exec(cmd, function(err, stdout, stderr){
    debug('command executed')
  })
}


/**
 * Reads a cookie from a file
 * @param  {string} cookiePath The path to the cookie file.
 * @return {object}            The cookie object
 */
function readCookie(cookiePath) {

  var cookie

  try {
    var c = fs.readFileSync(cookiePath)
    debug('loaded cookie', JSON.parse(c))
    var sid = c['connect-sid']
    debug('serialized', sid)
  } catch (e) {
    debug(e)
  }

  return cookie

}


/**
 * Write a cookie to file.
 * @param  {object} response   The express response object.
 * @param  {string} cookiePath The path to the cookie file.
 */
function writeCookie(response, cookiePath) {

  try {
    debug('got response')
    var cookies = cookie.parse(response.headers['set-cookie'][0])
    debug('connect.sid', cookies['connect.sid'])
    fs.writeFileSync(cookiePath, JSON.stringify(cookies))
  } catch (e) {
    debug(e)
  }

}


/**
 * Update last seen time.
 * @param  {objext} params The params update.
 * @param  {object} config Optional config.
 */
function updateLastSeen(params, config) {

  qpm_media.updateLastSeen(params, config).then(function(ret) {
    if (ret.conn) {
      var conn = ret.conn
      conn.close()
    }
  }).catch(function(err){
    if (err.conn) {
      var conn = err.conn
      conn.close()
    }
    console.error(err.err)
  })

}


// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv)
}

module.exports = bin
