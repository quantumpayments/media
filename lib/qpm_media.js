module.exports = {
  createTables : createTables,
  addMedia     : addMedia
}

// requires
var fs         = require('fs')
var program    = require('commander')
var wc_db      = require('wc_db')


/**
 * Creates database tables.
 */
function createTables() {
  // setup config
  var config = require('../config/config.js')

  var db = wc_db.getConnection(config.db)
  var sql = fs.readFileSync('model/Media.sql').toString()
  console.log(sql)
  db.query(sql).then(function(ret){
    console.log(ret)
  }).catch(function(err) {
    console.log(err)
  })

}

/**
 * Adds media to the database
 * @param {string} uri The URI to add.
 */
function addMedia(uri, contentType) {
  var config = require('../config/config.js')
  var db = wc_db.getConnection(config.db)

  // guess content type
  if (!contentType) {
    if (uri.indexOf('.jpg') !== -1) {
      contentType = 'image'
    }
    if (uri.indexOf('.png') !== -1) {
      contentType = 'image'
    }
    if (uri.indexOf('.gif') !== -1) {
      contentType = 'image'
    }
    if (uri.indexOf('.svg') !== -1) {
      contentType = 'image'
    }
  }

  var sql = 'INSERT into Media values (NULL, :uri, NULL, NULL, NULL, :contentType)'

  db.query(sql, { replacements: { "uri" : uri, "contentType" : contentType } }).then(function(ret){
    console.log(ret)
  }).catch(function(err) {
    console.log(err)
  })


}
