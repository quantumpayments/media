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
var url           = require('url')
var urlencode     = require('urlencode')
var webcredits    = require('webcredits')
var wc_db         = require('wc_db')

// globals
var cost    = 25
var root    = __dirname
var workbot = 'https://workbot.databox.me/profile/card#me'

/**
* version as a command
*/
function bin(argv) {

  debug('start')

  // setup config
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

  var uri       = process.argv[2]  || 'https://localhost:3000/random_rate'
  var cert      = process.argv[3]  || process.env['CERT']
  var display   = process.argv[4]  || process.env['DISP'] || 'display'
  var mode      = process.argv[5]  || 'buffer'
  var user      = process.argv[6]  || 'http://melvincarvalho.com/#me'
  var tag       = process.argv[7]
  var bufferURI = process.argv[8]  || 'https://localhost/data/buffer/video/'
  root          = process.argv[9]  || root
  var safe      = process.argv[10] || 'on'

  debug(argv)

  console.log(process.argv)
  console.log('tag', tag)
  console.log('bufferURI', bufferURI)
  console.log('webid', user)

  var config = require(__dirname + '/../config/config.js')

  getMedia(uri, cert, mode, user, safe, bufferURI).then(function(row) {

    var uri = row.uri
    var cacheURI = row.cacheURI
    var displayURI = cacheURI || uri
    var cmd = display + ' ' + displayURI

    debug('cmd', cmd)
    debug('row', row)
    exec(cmd)
    var params = { cacheURI : cacheURI }
    params.reviewer = user
    updateLastSeen(params, config)

  }).catch(function(err){
    console.error(err)
  })

}

/**
* Get Media item
* @param  {string} uri       The uri to get it from.
* @param  {string} cert      Location of an X.509 cert.
* @param  {string} mode      Mode api | http | buffer.
* @param  {string} user      The WebID of the user.
* @param  {number} safe      Whether safe search is on.
* @param  {string} bufferURI The URI of the buffer.
* @return {object}           Promise with the row.
*/
function getMedia(uri, cert, mode, user, safe, bufferURI) {

  if (mode === 'api') {

    return getMediaByAPI(uri, cert, mode, user, safe, bufferURI)

  } else if (mode === 'buffer') {

    return getMediaByBuffer(uri, cert, mode, user, safe, bufferURI)

  } else if (mode === 'http') {

    return getMediaByHTTP(uri, cert, mode, user, safe, bufferURI)

  }

}

/**
* Get Media item from buffer
* @param  {string} uri       The uri to get it from.
* @param  {string} cert      Location of an X.509 cert.
* @param  {string} mode      Mode api | http | buffer.
* @param  {string} user      The WebID of the user.
* @param  {number} safe      Whether safe search is on.
* @param  {string} bufferURI The URI of the buffer.
* @return {object}           Promise with the row.
*/
function getMediaByBuffer(uri, cert, mode, user, safe, bufferURI) {

  var bufferPath = root
  if (bufferURI) {
    bufferPath += '/../' + url.parse(bufferURI).path
  }

  return new Promise(function(resolve, reject) {

    balance(user).then((ret)=>{
      return ret
    }).then(function(ret){
      if (ret >= cost) {

        //var bufferPath = __dirname + '/../data/buffer/image/'
        debug('bufferPath', bufferPath)
        var files = fs.readdirSync(bufferPath)
        files.sort(function(a, b) {
          return fs.statSync(bufferPath + b).mtime.getTime() -
          fs.statSync(bufferPath + a).mtime.getTime()
        })

        var file = getNextFile(files)
        debug('nextFile', file)
        if (file) {
          var nextFile = bufferPath + file
          var ret = { 'uri' : nextFile, 'cacheURI' : urlencode.decode(file) }
          var lastFile = bufferPath + files[files.length - 1]
          resolve(ret)
        } else {
          reject(new Error('nothing in buffer'))
        }

        addMediaToBuffer(uri, cert, mode, user, safe, bufferURI)

      } else {
        reject(new Error('not enough funds'))
      }
    })

  })

}

/**
* Adds media to buffer
* @param  {string} uri       The uri to get it from.
* @param  {string} cert      Location of an X.509 cert.
* @param  {string} mode      Mode api | http | buffer.
* @param  {string} user      The WebID of the user.
* @param  {number} safe      Whether safe search is on.
* @param  {string} bufferURI The URI of the buffer.
* @return {object}           Promise with the row.
*/
function addMediaToBuffer(uri, cert, mode, user, safe, bufferURI) {

  var bufferPath = root
  if (bufferURI) {
    bufferPath += '/../' + url.parse(bufferURI).path
  }

  setTimeout(() => {
    try {
      //fs.unlinkSync(lastFile)
    } catch (e) {
      console.error(e)
    }
    var params = {}
    params.reviewer = user
    if (safe && safe === 'off') {
      params.safe = 0
    } else {
      params.safe = 1
    }
    qpm_media.getRandomUnseenImage(params).then(function(row) {
      debug('unseen', row.ret)
      var cacheURI = row.ret[0][0].cacheURI
      var filePath = cacheURI.substr('file://'.length)
      console.log('copying', filePath)

      //copyMedia(filePath, bufferPath + urlencode(cacheURI), function (err) {
      copyMedia(filePath, bufferURI + urlencode(cacheURI), cert, function (err) {

        if (err) {
          debug(err)
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

  }, 500)

}

/**
 * copy media from one place to another
 * @param  {string}   path     from where to copy
 * @param  {string}   to       where to copy to
 * @param  {string}   cert     path to certificate
 * @param  {Function} callback callback
 */
function copyMedia(path, to, cert, callback) {

  var hookPath = __dirname + '/../data/buffer/hook.sh'
  debug('copyMedia', path, to, cert)

  if (/^http/.test(to)) {
    debug('using http')
    var parsed = url.parse(to)
    debug('parsed', parsed)

    var domain = url.parse(to).domain
    var file   = url.parse(to).path
    debug(domain, file)

    var a   = parsed.pathname.split('/')
    var uri = parsed.protocol + '//' + parsed.host
    for (var i = 0; i < a.length-1; i++) {
      uri += a[i] + '/'
    }
    uri +=   urlencode(a[i])
    debug('uri', uri)

    //uri = 'https://phone.servehttp.com:8000/data/buffer/image/'  + urlencode('file%3A%2F%2F%2Fmedia%2Fmelvin%2FElements%2Fpichunter.com%2F2443342_15_o.jpg')

    var options = {
      method  : 'PUT',
      url     : uri,
      key     : fs.readFileSync(cert),
      cert    : fs.readFileSync(cert),
      headers : { //We can define headers too
        "Content-Type" : "image/jpg"
      }
    }

    debug(options)
    fs.createReadStream(path).pipe(request.put(options, function (err, response, body) {
      if (err) {
        debug(err)
      } else {
        debug('success')
        setTimeout(function(){
          exec(hookPath)
        }, 0)
      }
    }))

  } else {

    fs.copy(path, to, function (err) {
      if (err) {
        callback(err)
      } else {
        callback(null, null)
        setTimeout(function(){
          exec(hookPath)
        }, 0)
      }
    })

  }

}

/**
* Get Media item from API
* @param  {string} uri       The uri to get it from.
* @param  {string} cert      Location of an X.509 cert.
* @param  {string} mode      Mode api | http | buffer.
* @param  {string} user      The WebID of the user.
* @param  {number} safe      Whether safe search is on.
* @param  {string} bufferURI The URI of the buffer.
* @return {object}           Promise with the row.
*/
function getMediaByAPI(uri, cert, mode, user, safe, bufferURI) {

  return new Promise(function(resolve, reject) {

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

  })

}

/**
* Get Media item from HTTP
* @param  {string} uri       The uri to get it from.
* @param  {string} cert      Location of an X.509 cert.
* @param  {string} mode      Mode api | http | buffer.
* @param  {string} user      The WebID of the user.
* @param  {number} safe      Whether safe search is on.
* @param  {string} bufferURI The URI of the buffer.
* @return {object}           Promise with the row.
*/
function getMediaByHTTP(uri, cert, mode, user, safe, bufferURI) {

  return new Promise(function(resolve, reject) {

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

  })

}

/**
* Execute a command
* @param  {string} cmd Command as a string.
*/
function exec(cmd) {
  debug('executing cmd', cmd)
  child_process.exec(cmd, function(err, stdout, stderr){
    debug('command completed')
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

/**
 * get a balance
 * @param  {string} source URI of the user
 * @param  {object} conn   connection
 * @param  {object} config config
 * @return {object}        promise with balance
 */
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

/**
 * make a payment
 * @param  {object} credit The webcredit
 * @param  {object} conn   connection
 * @param  {object} config config
 * @return {object}        promise with balance
 */
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
 * Gets the next file in a buffer
 * @param  {array}  files Array of files
 * @param  {number} type  Type of file to get
 * @return {string}       Path to file
 */
function getNextFile(files, type) {

  for (var i = 0; i < files.length; i++) {
    var file = files[i]
    if (/.ttl$/.test(file)) {
      continue
    }
    return file
  }

}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv)
}

module.exports = bin
