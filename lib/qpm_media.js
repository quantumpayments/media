module.exports = {
  addMedia       : addMedia,
  addRating      : addRating,
  createTables   : createTables,
  getRandomImage : getRandomImage
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

  var sql = fs.readFileSync('model/Rating.sql').toString()
  console.log(sql)
  db.query(sql).then(function(ret){
    console.log(ret)
  }).catch(function(err) {
    console.log(err)
  })

}

/**
 * Adds media to the database
 * @param {string} uri         The URI to add.
 * @param {string} contentType The content type.
 * @param {Object} callback    The callback.
 */
function addMedia(uri, contentType, callback) {
  if (!uri || uri === '') {
    return 'You must enter a valid uri'
  }
  return new Promise((resolve, reject) => {

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
      return resolve(ret)
    }).catch(function(err) {
      return reject(err)
    })

  })

}


/**
 * Adds rating to the database
 * @param {Object} rating  The rating to add.
 * @param {Object} Promise with success or fail.
 */
function addRating(rating) {
  if (!rating.uri || rating.uri === '') {
    return 'You must enter a valid uri'
  }
  if (!rating.reviewer || rating.reviewer === '') {
    return 'You must enter a valid reviewer'
  }
  if (isNaN(rating.rating)) {
    return 'You must enter a valid rating'
  }
  return new Promise((resolve, reject) => {

    var config = require('../config/config.js')
    var db = wc_db.getConnection(config.db)

    var sql = 'INSERT into Rating values (NULL, :uri, NULL, :rating, :reviewer, NULL)'

    db.query(sql, { replacements: { "uri" : rating.uri, "reviewer" : rating.reviewer, "rating" : rating.rating } }).then(function(ret){
      return resolve(ret)
    }).catch(function(err) {
      return reject(err)
    })

  })

}


/**
 * Returns a random image
 * @param  {Object} callback The callback function.
 * @return {string} Returns a random image.
 */
function getRandomImage(callback) {
  var config = require('../config/config.js')
  var db = wc_db.getConnection(config.db)

  var sql = 'SELECT uri from Media order by RAND() LIMIT 1;'

  db.query(sql).then(function(ret){
    callback(null, ret)
  }).catch(function(err) {
    callback(err)
  })
}
