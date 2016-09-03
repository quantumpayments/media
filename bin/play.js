#!/usr/bin/env node

var debug         = require('debug')('qpm_media:play')
debug('begin qpm_media:play')

// requires
var child_process = require('child_process')
var cookie        = require('cookie')
var fs            = require('fs-extra')
var program       = require('commander')
var qpm_media     = require('../lib/qpm_media')
var request       = require('request')
var urlencode     = require('urlencode')
var url           = require('url')
var webcredits    = require('webcredits')
var wc_db         = require('wc_db')


var workbot = 'https://workbot.databox.me/profile/card#me'
var cost    = 40
var type    = 0
var root    = __dirname
var seen    = []
var sort    = 'desc'


/**
* version as a command
*/
function bin(argv) {
  // setup config

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

  var uri     = process.argv[2]  || 'https://localhost:4000/random_rate?type=getLastFragment'
  var cert    = process.argv[3]  || process.env['CERT']
  var display = process.argv[4]  || process.env['DISP'] || 'display'
  var mode    = process.argv[5]  || 'buffer'
  var user    = process.argv[6]  || 'http://melvincarvalho.com/#me'
  var tag     = process.argv[7]
  var path    = process.argv[8]  || 'https://localhost/data/buffer/video/'
  root        = process.argv[9]  || root
  var safe    = process.argv[10] || 'on'
  var buffers = process.argv[11] || 2

  if (url) {
    path = url.parse(path).path
  }

  console.log(process.argv)
  console.log('tag', tag)
  console.log('path', path)
  console.log('webid', user)

  var config = require(__dirname + '/../config/config.js')

  getMedia(uri, cert, mode, user, tag, path, safe, buffers).then(function(row) {

    debug('media returned')
    debug(row)
    var json = row
    var uri = row.uri
    var cacheURI = row.cacheURI
    var displayURI = cacheURI || uri
    var cmd = display + ' ' + displayURI

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
    //params.id = json.id
    params.start = start
    params.end = end
    params.webid = user

    debug('adding fragment', params)

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

  }).catch(function(err){
    console.error(err)
  })

}

function getFnFromURI(uri, parent) {
  var arr = uri.split('=')
  var ret = arr[arr.length-1]
  if (parent) {
    ret = parent + '.' + ret
  }
  return ret
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

/**
 * Get Media item
 * @param  {string} uri     The uri to get it from.
 * @param  {string} cert    Location of an X.509 cert.
 * @param  {string} mode    Mode api | http | buffer.
 * @param  {string} user    The WebID of the user.
 * @param  {number} buffers The number of buffers
 * @return {object}         Promise with the row.
 */
function getMedia(uri, cert, mode, user, tag, path, safe, buffers) {

  return new Promise(function(resolve, reject) {

    if (mode === 'api') {

      balance(user).then((ret)=>{
        debug('got balance')
        return ret
      }).then(function(ret){
        var fn = getFnFromURI(uri, 'qpm_media')
        debug('uri', uri)
        debug('fn', fn)
        debug('ret', ret)
        debug('cost', cost)
        debug(qpm_media.getLastFragment)
        if (ret >= cost) {
          if (fn === 'qpm_media.getLastFragment') {

            qpm_media.getLastFragment().then(function(row) {
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

          } else if (fn === 'qpm_media.getRatedFragment') {

            qpm_media.getRatedFragment().then(function(row) {
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

          } else if (fn === 'qpm_media.getRandomUnseenFragment') {

            qpm_media.getRandomUnseenFragment().then(function(row) {
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

          }
        } else {
          reject(new Error('not enough funds'))
        }
      })

    } else if (mode === 'buffer') {
      var fn = getFnFromURI(uri, 'qpm_media')
      debug('fn', fn)

      if (fn === 'qpm_media.getLastFragment') {
        type = 0

        balance(user).then((ret)=>{
          return ret
        }).then(function(ret){
          if (ret >= cost) {

            var bufferPath = root + '/../' + path
            var files = fs.readdirSync(bufferPath)

            var f = []
            for (var i = 0; i < files.length; i++) {
              var file    = files[i]
              if ( file && /.ttl$/.test(file) ) {
                continue
              }
              var mtime   = fs.statSync(bufferPath + file).mtime.getTime()
              var start   = getStart(file)
              var type    = getType(file)
              var fileURI = getFile(file)
              f.push({ "mtime" : mtime, "uri" : file, "file" : fileURI, "start" : start, "type" : type })
            }

            f.sort(sortFiles)
            debug('f', f)

            var current = getCurrentVideo(0, f, buffers)
            debug('current', current, f[current], f[current - 1].uri)

            files.sort(function(a, b) {
               return fs.statSync(bufferPath + b).mtime.getTime() -
                      fs.statSync(bufferPath + a).mtime.getTime()
            })
            var file = getNextFile(files, type)
            file = f[current].uri

            debug('file', file)
            if (files && file) {
              var duration = 15
              var nextFile = bufferPath + file
              var start = file.split(',')[0]
              var end = parseInt(start)
              var cacheURI = removeComma(file)
              debug('removed comma', cacheURI)
              cacheURI = urlencode.decode(cacheURI)
              cacheURI = removeMp4(cacheURI)
              var ret = { 'uri' : cacheURI, 'cacheURI' : cacheURI, 'end' : end }
              debug(ret)
              var lastFile = bufferPath + getLastFile(files, type)
              resolve(ret)
            } else {
              reject(new Error('nothing in buffer'))
            }

            setTimeout(() => {
              try {
                //fs.unlinkSync(lastFile)
              } catch (e) {
                console.error(e)
              }

              var fn = getFnFromURI(uri)
              var params = {}
              if (tag) {
                params.tag = tag
              }
              if (user) {
                params.webid = user
              }
              if (safe && safe === 'off') {
                params.safe = 0
              } else {
                params.safe = 1
              }
              qpm_media.getLastFragment(params).then(function(row) {
                debug('getLastFragment', row.ret)
                debug('files', files)

                var duration    = 15
                var start       = parseInt(row.ret[0][0].end) + (duration * (buffers-1) )
                splitVideo(start, bufferPath, path, row, true, user, 0, duration)

                var duration    = 15
                var start       = parseInt(row.ret[0][0].end) + (duration * (buffers-2) )
                var candidate = start + ',' + type + ',' + urlencode(row.ret[0][0].uri) + '.mp4'
                debug('candidate', candidate )
                if ( files.indexOf(candidate) !== -1 ) {
                  debug('candidate is in files')
                } else {
                  debug('candidate is NOT in files')
                  if (parseInt(buffers) === 2) {
                    splitVideo(start, bufferPath, path, row, true, user, 0, duration)
                  }
                }
                //var buffers = 2

              })

            }, 500)

          } else {
            reject(new Error('not enough funds'))
          }
        })

      } else if (fn === 'qpm_media.getRatedFragment') {
        type = 1

        balance(user).then((ret)=>{
          return ret
        }).then(function(ret){
          if (parseInt(ret) >= parseInt(cost)) {
            debug('balance', parseInt(ret), 'cost', parseInt(cost), 'path', path)

            var bufferPath = root + '/..' + path
            debug('buffer', bufferPath)
            var files = fs.readdirSync(bufferPath)
            files.sort(function(a, b) {
               return fs.statSync(bufferPath + b).mtime.getTime() -
                      fs.statSync(bufferPath + a).mtime.getTime()
            })
            var file = getNextFile(files, type)
            debug('next file', file)
            if (files && file) {
              var file = getNextFile(files, type)
              var nextFile = bufferPath + file
              var start = file.split(',')[0]
              var end = parseInt(start)
              var cacheURI = removeComma(file)
              debug('removed comma', cacheURI)
              cacheURI = urlencode.decode(cacheURI)
              cacheURI = removeMp4(cacheURI)
              var ret = { 'uri' : cacheURI, 'cacheURI' : cacheURI, 'end' : end }
              debug(ret)
              var lastFile = bufferPath + getLastFile(files, type)
              resolve(ret)
            } else {
              reject(new Error('nothing in buffer'))
            }

            setTimeout(() => {
              try {
                //fs.unlinkSync(lastFile)
              } catch (e) {
                console.error(e)
              }

              var fn = getFnFromURI(uri)
              fn = qpm_media.getRatedFragment
              params = {}
              if (tag) {
                fn = qpm_media.getTaggedFragment
                params.tag = tag
              }
              if (user) {
                params.webid = user
              }
              if (safe && safe === 'off') {
                params.safe = 0
              } else {
                params.safe = 1
              }
              fn(params).then(function(row) {
                /*
                debug('unseen', row.ret)
                var start    = row.ret[0][0].end
                var cacheURI = row.ret[0][0].cacheURI || row.ret[0][0].uri
                var filePath = cacheURI.substr('file://'.length)
                var destination = start + ',' + type + ',' + urlencode(cacheURI) + '.mp4'
                var subtitles = row.ret[0][0].subtitlesURI || ''
                subtitlesCmd = ''
                if (/file:\/\//.test(subtitles)) {
                  subtitles = subtitles.substr(7)
                }
                if (subtitles) {
                  if (subtitles) {
                    var charenc = row.ret[0][0].charenc
                    var subtitlesCmd = ' -vf subtitles="' + subtitles + '"'
                    if (charenc) {
                      subtitlesCmd += ':charenc=' + charenc + ' '
                    }

                  }
                }
                console.log('copying', filePath)
                */

                var start = row.ret[0][0].end
                var duration = 15

                splitVideo(start, bufferPath, path, row, true, user, 1, duration)


                /*
                var cmd = 'sleep 1 ; ffmpeg -i "' + filePath + '" -ss '+ start +' -movflags faststart -strict -2  ' + subtitlesCmd + ' -t 00:00:15 "' + bufferPath + destination + '"'

                debug(cmd)

                exec(cmd, function (err) {
                  if (err) {
                    console.error(err)
                  } else {

                    hook(root + '/..' + path + '../hook.sh', destination)

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
                */

              })

              var params = {}
              if (tag) {
                params.tag = tag
              }
              if (user) {
                params.webid = user
              }
              if (safe && safe === 'off') {
                params.safe = 0
              } else {
                params.safe = 1
              }
              qpm_media.getLastFragment(params).then(function(row) {

                debug('getLastFragment', row.ret)
                debug('files', files)

                var duration    = 15
                var start       = parseInt(row.ret[0][0].end) + (duration * (buffers-1) )
                splitVideo(start, bufferPath, path, row, true, user, 0, duration)

                var duration    = 15
                var start       = parseInt(row.ret[0][0].end) + (duration * (buffers-2) )
                var candidate = start + ',' + type + ',' + urlencode(row.ret[0][0].uri) + '.mp4'
                debug('candidate', candidate )
                if ( files.indexOf(candidate) !== -1 ) {
                  debug('candidate is in files')
                } else {
                  debug('candidate is NOT in files')
                  if (parseInt(buffers) === 2) {
                    splitVideo(start, bufferPath, path, row, true, user, 0, duration)
                  }
                }


                /*
                debug('unseen', row.ret)
                var start    = row.ret[0][0].end
                var cacheURI = row.ret[0][0].cacheURI || row.ret[0][0].uri
                var filePath = cacheURI.substr('file://'.length)
                var destination =  start + ',' + 0 + ',' + urlencode(cacheURI) + '.mp4'
                var subtitles = row.ret[0][0].subtitlesURI || ''
                subtitlesCmd = ''
                if (/file:\/\//.test(subtitles)) {
                  subtitles = subtitles.substr(7)
                }
                if (subtitles) {
                  if (subtitles) {
                    var charenc = row.ret[0][0].charenc
                    var subtitlesCmd = ' -vf subtitles="' + subtitles + '"'
                    if (charenc) {
                      subtitlesCmd += ':charenc=' + charenc + ' '
                    }

                  }
                }
                console.log('copying', filePath)
                var start = row.ret[0][0].end
                var duration = 15

                splitVideo(filePath, start, subtitlesCmd, bufferPath, destination, path, row, false, user)

                if ( parseInt(buffers) === 2 ) {
                  setTimeout(function() {
                    var destination =  ( start + duration ) + ',' + 0 + ',' + urlencode(cacheURI) + '.mp4'
                    splitVideo(filePath, start + duration, subtitlesCmd, bufferPath, destination, path, row, false, user)
                  }, duration * 500)
                }
                */

                /*
                var cmd = 'ffmpeg -i "' + filePath + '" -ss '+ start +' -movflags faststart -strict -2  ' + subtitlesCmd + ' -t 00:00:15 "' + bufferPath + destination + '"'
                debug(cmd)

                exec(cmd, function (err) {
                  if (err) {
                    console.error(err)
                  } else {

                    hook(root + '/..' + path + '../hook.sh', destination)

                    console.log("success!")

                    if (row && row.conn) {
                      row.conn.close()
                    }
                  }

                })
                */

              })

            }, 500)

          } else {
            reject(new Error('not enough funds'))
          }
        })

      } else if (fn === 'qpm_media.getRandomUnseenFragment') {
        type = 2

        balance(user).then((ret)=>{
          return ret
        }).then(function(ret){
          if (ret >= cost) {
            var bufferPath = root + '/..' + path
            debug('bufferPath', bufferPath)
            var files = fs.readdirSync(bufferPath)
            files.sort(function(a, b) {
               return fs.statSync(bufferPath + b).mtime.getTime() -
                      fs.statSync(bufferPath + a).mtime.getTime()
            })
            var file = getNextFile(files, type)
            if (files && file) {
              var file = getNextFile(files, type)
              var nextFile = bufferPath + file
              var start = file.split(',')[0]
              var end = parseInt(start)
              var cacheURI = removeComma(file)
              debug('removed comma', cacheURI)
              cacheURI = urlencode.decode(cacheURI)
              cacheURI = removeMp4(cacheURI)
              var ret = { 'uri' : cacheURI, 'cacheURI' : cacheURI, 'end' : end }
              debug(ret)
              var lastFile = bufferPath + getLastFile(files, type)
              resolve(ret)
            } else {
              reject(new Error('nothing in buffer'))
            }

            setTimeout(() => {
              try {
                //fs.unlinkSync(lastFile)
              } catch (e) {
                console.error(e)
              }

              var fn = getFnFromURI(uri)
              var params = {}
              if (tag) {
                params.tag = tag
              }
              if (user) {
                params.webid = user
              }
              if (safe && safe === 'off') {
                params.safe = 0
              } else {
                params.safe = 1
              }
              debug('play.js', params, safe)
              qpm_media.getRandomUnseenFragment(params).then(function(row) {
                debug('getRandomUnseenFragment', row.ret)

                var start = 0
                var duration = 15

                splitVideo(start, bufferPath, path, row, true, user, 2, duration)


                /*
                var cmd = 'ffmpeg -i "' + filePath + '" -ss '+ start +' -movflags faststart -strict -2 ' + subtitlesCmd + ' -t 00:00:15 "' + bufferPath + destination + '"'
                debug(cmd)

                exec(cmd, function (err) {
                  if (err) {
                    console.error(err)
                  } else {

                    hook(root + '/..' + path + '../hook.sh', destination)

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
                */

              })


              debug('now getting last fragment seen')
              var params = {}
              if (tag) {
                params.tag = tag
              }
              if (user) {
                params.webid = user
              }
              if (safe && safe === 'off') {
                params.safe = 0
              } else {
                params.safe = 1
              }
              qpm_media.getLastFragment(params).then(function(row) {

                debug('getLastFragment', row.ret)
                debug('files', files)

                var duration    = 15
                var start       = parseInt(row.ret[0][0].end) + (duration * (buffers-1) )
                splitVideo(start, bufferPath, path, row, true, user, 0, duration)

                var duration    = 15
                var start       = parseInt(row.ret[0][0].end) + (duration * (buffers-2) )
                var candidate = start + ',' + type + ',' + urlencode(row.ret[0][0].uri) + '.mp4'
                debug('candidate', candidate )
                if ( files.indexOf(candidate) !== -1 ) {
                  debug('candidate is in files')
                } else {
                  debug('candidate is NOT in files')
                  if (parseInt(buffers) === 2) {
                    splitVideo(start, bufferPath, path, row, true, user, 0, duration)
                  }
                }


                /*
                debug('unseen', row.ret)
                var start    = row.ret[0][0].end
                var cacheURI = row.ret[0][0].cacheURI || row.ret[0][0].uri
                var filePath = cacheURI.substr('file://'.length)
                var destination =  start + ',' + 0 + ',' + urlencode(cacheURI) + '.mp4'
                */
                /*
                var subtitles = row.ret[0][0].subtitlesURI || ''
                subtitlesCmd = ''
                if (/file:\/\//.test(subtitles)) {
                  subtitles = subtitles.substr(7)
                }
                if (subtitles) {
                  if (subtitles) {
                    var charenc = row.ret[0][0].charenc
                    var subtitlesCmd = ' -vf subtitles="' + subtitles + '"'
                    if (charenc) {
                      subtitlesCmd += ':charenc=' + charenc + ' '
                    }

                  }
                }
                */
               /*
                console.log('copying', filePath)
                console.log('buffers', buffers)
                var duration = 15

                splitVideo(filePath, start, subtitlesCmd, bufferPath, destination, path, row, false, user)

                if ( parseInt(buffers) === 2 ) {
                  setTimeout(function() {
                    var destination =  ( start + duration ) + ',' + 0 + ',' + urlencode(cacheURI) + '.mp4'
                    splitVideo(filePath, start + duration, subtitlesCmd, bufferPath, destination, path, row, false, user)
                  }, duration * 500)
                }
                */
                /*
                var cmd = 'ffmpeg -i "' + filePath + '" -ss '+ row.ret[0][0].end +' -movflags faststart -strict -2  ' + subtitlesCmd + ' -t 00:00:15 "' + bufferPath + destination + '"'
                debug(cmd)

                exec(cmd, function (err) {
                  if (err) {
                    console.error(err)
                  } else {

                    hook(root + '/..' + path + '../hook.sh', destination)

                    console.log("success!")

                    if (row && row.conn) {
                      row.conn.close()
                    }
                  }

                })
                */

              })

            }, 500)

          } else {
            reject(new Error('not enough funds'))
          }
        })

      }

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


function getNextFile(files, type) {

  for (var i = 0; i < files.length; i++) {
    var file = files[i]
    var t = file.split(',')[1]
    debug(file)
    debug(type)
    debug(t)
    if (parseInt(t) === parseInt(type)) {
      return files[i]
    }
  }

}

function getLastFile(files, type) {

  for (var i = files.length-1; i >= 0; i--) {
    var file = files[i]
    var t = file.split(',')[1]
    debug(file)
    debug(type)
    debug(t)
    if (parseInt(t) === parseInt(type)) {
      return files[i]
    }
  }

}

function removeComma(uri) {
  var ret =  uri.replace(/^[0-9]+,/, '')
  ret =  ret.replace(/^[0-9]+,/, '')
  return ret
}

function removeMp4(uri) {
  var ret =  uri.replace(/.mp4$/, '')
  return ret
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

function splitVideo(start, bufferPath, path, row, doPay, user, type, duration) {
  console.log('split', start, bufferPath)

  var cacheURI    = row.ret[0][0].cacheURI || row.ret[0][0].uri
  var filePath    = cacheURI.substr('file://'.length)
  var destination = start + ',' + type + ',' + urlencode(cacheURI) + '.mp4'

  var subtitles   = row.ret[0][0].subtitlesURI || ''
  var subtitlesCmd    = ''
  if (/file:\/\//.test(subtitles)) {
    subtitles = subtitles.substr(7)
  }
  if (subtitles) {
    var charenc = row.ret[0][0].charenc
    var subtitlesCmd = ' -vf subtitles="' + subtitles + '"'
    if (charenc) {
      subtitlesCmd += ':charenc=' + charenc + ' '
    }
  }

  var cmd = 'ffmpeg -i "' + filePath + '" -ss ' + start + ' -preset ultrafast -movflags +faststart -strict -2  ' + subtitlesCmd + ' -t 00:00:15 "' + bufferPath + destination + '"'
  debug(cmd)

  exec(cmd, function (err) {
    if (err) {
      console.error(err)
    } else {

      hook(root + '/..' + path + '../hook.sh', destination)

      console.log("success!")

      if (doPay) {
        console.log("success!")
        // pay
        var credit = {}
        credit['https://w3id.org/cc#source'] = user
        credit['https://w3id.org/cc#amount'] = cost
        credit['https://w3id.org/cc#currency'] = 'https://w3id.org/cc#bit'
        credit['https://w3id.org/cc#destination'] = workbot
        pay(credit)

      }

      if (row && row.conn) {
        row.conn.close()
      }
    }

  })

}

/**
 * Execute a command
 * @param  {string} cmd Command as a string.
 */
function exec(cmd, callback) {
  debug('executing cmd', cmd)
  child_process.exec(cmd, function(err, stdout, stderr){
    debug('command completed')
    if (err) {
      if (callback) {
        callback(err)
      }
    } else {
      if (callback) {
        callback(null, stdout, stderr)
      }
    }
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

function hook(file, param, timeout) {
  file    = file    || root + '/..' + path + '../hook.sh'
  timeout = timeout || 0

  var cmd
  if (param) {
    cmd = file + ' "' + param + '"'
  } else {
    cmd = file
  }
  debug('hook', cmd)

  setTimeout(function(){
    exec(cmd, function (err, stdout, stderr) {
      debug('stdout of hook', stdout)
    })
  }, timeout)

}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv)
}

/**
 * sort files
 * @param  {object} a first element
 * @param  {object} b second element
 */
function sortFiles(a, b) {
  if (a.type === b.type) {
    if (a.file === b.file) {
      var ai = a.start || a.mtime || a.index
      var bi = b.start || b.mtime || b.index
      if (sort === 'desc') {
        return parseFloat(bi) - parseFloat(ai)
      } else {
        return parseFloat(ai) - parseFloat(bi)
      }
    } else {
      var ai = a.mtime || a.index
      var bi = b.mtime || b.index
      if (sort === 'desc') {
        return parseFloat(bi) - parseFloat(ai)
      } else {
        return parseFloat(ai) - parseFloat(bi)
      }
    }
  } else {
    var order = [1,2,0]
    return order[b.type] - order[a.type]
  }
}

/**
* Get type of uri
* @param  {string} str The uri
* @return {number}     The type or null
*/
function getType(str) {
  var ret = null
  var match = /[0-9]+,[0-9]+,.*/.test(str)
  if (!match) {
    return null
  }
  var a = str.split(',')
  if (a && a[1]) {
    ret = parseInt(a[1])
  } else {
    return null
  }
  if (isNaN(ret)) {
    return null
  }
  return ret
}

/**
* Get file of uri
* @param  {string} str The uri
* @return {string}     The file or null
*/
function getFile(str) {
  var ret = null
  var match = /[0-9]+,[0-9]+,.*/.test(str)
  if (!match) {
    return null
  }
  var a = str.split(',')
  if (a && a[2]) {
    ret = a[2]
    return ret
  } else {
    return null
  }
  if (isNaN(ret)) {
    return null
  }
  return ret
}

/**
* Get start of uri
* @param  {string} str The uri
* @return {number}     The start or -1
*/
function getStart(str) {
  var ret = null
  var match = /[0-9]+,[0-9]+,.*/.test(str)
  if (!match) {
    return null
  }
  var a = str.split(',')
  if (a && a[0]) {
    var end = a[0]
    ret = parseInt(end)
    return ret
  } else {
    return null
  }
  if (isNaN(ret)) {
    return null
  }
  return ret
}

function getCurrentVideo(type, files, buffers) {
  debug('getCurrentVideo', type, buffers)
  var count = 0
  for (var i = 0; i < files.length; i++) {
    var file = files[i]
    var href = file.uri
    if (getType(href) === type) {
      count++
      debug('getCurrentVideo', count, buffers)
      if (count === parseInt(buffers) || type != 0) {
        if ( seen.indexOf(file.uri) === -1 ) {
          seen.push(file.uri)
          return i
        } else {
          seen.push(files[candidate].uri)
          return candidate
        }
      }
      var candidate = i
      debug('candidate', candidate)
    }
  }
}

module.exports = bin
