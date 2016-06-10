module.exports = {
  addMedia                : addMedia,
  addMediaTag             : addMediaTag,
  addTag                  : addTag,
  addFragment             : addFragment,
  addRating               : addRating,
  createTables            : createTables,
  getLastFragment         : getLastFragment,
  getLastSeen             : getLastSeen,
  getRandomImage          : getRandomImage,
  getRandomUnseenImage    : getRandomUnseenImage,
  getRating               : getRating,
  getRandomUnseenFragment : getRandomUnseenFragment,
  getRatedFragment        : getRatedFragment,
  getTags                 : getTags,
  getTopImages            : getTopImages,
  rateLastSeen            : rateLastSeen,
  search                  : search,
  updateLastSeen          : updateLastSeen
}

// requires
var debug      = require('debug')('qpm_media:qpm_media')
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
  debug(sql)
  db.query(sql).then(function(ret){
    debug(ret)
  }).catch(function(err) {
    debug(err)
  })

  var sql = fs.readFileSync('model/Rating.sql').toString()
  debug(sql)
  db.query(sql).then(function(ret){
    debug(ret)
  }).catch(function(err) {
    debug(err)
  })

  var sql = fs.readFileSync('model/Tag.sql').toString()
  debug(sql)
  db.query(sql).then(function(ret){
    debug(ret)
  }).catch(function(err) {
    debug(err)
  })

  var sql = fs.readFileSync('model/MediaTag.sql').toString()
  debug(sql)
  db.query(sql).then(function(ret){
    debug(ret)
  }).catch(function(err) {
    debug(err)
  })

  var sql = fs.readFileSync('model/Fragment.sql').toString()
  debug(sql)
  db.query(sql).then(function(ret){
    debug(ret)
  }).catch(function(err) {
    debug(err)
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
      if (uri.indexOf('.mp4') !== -1) {
        contentType = 'video'
      }
      if (uri.indexOf('.mpg') !== -1) {
        contentType = 'video'
      }
      if (uri.indexOf('.mov') !== -1) {
        contentType = 'video'
      }
      if (uri.indexOf('.wmv') !== -1) {
        contentType = 'video'
      }
      if (uri.indexOf('.avi') !== -1) {
        contentType = 'video'
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
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function addRating(rating, config, conn) {

  // validate
  if (!rating.uri || rating.uri === '') {
    return 'You must enter a valid uri'
  }
  if (!rating.reviewer || rating.reviewer === '') {
    return 'You must enter a valid reviewer'
  }
  if (isNaN(rating.rating)) {
    return 'You must enter a valid rating'
  }

  // defaults
  config = config || require('../config/config.js')

  debug(rating)

  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    insertRating(rating, config, conn).then(function(ret) {
      return resolve({"ret": ret, "conn": conn})
    }).catch(function(err) {
      return updateRating(rating, config, conn)
    }).then(function(ret){
      return resolve({"ret": ret, "conn": conn})
    }).catch(function(){
      return reject({"ret": ret, "conn": conn})
    })


  })

}


/**
 * Adds a tag to the database
 * @param {Object} params  The tag info.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function addTag(params, config, conn) {

  // validate
  if (!params.tag || params.tag === '') {
    return 'You must enter a valid uri'
  }

  // defaults
  config = config || require('../config/config.js')

  debug(params)

  // main
  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = 'INSERT into Tag values (NULL, :tag)'
    debug(sql)

    conn.query(sql, { replacements: { "tag" : params.tag } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}

/**
 * Adds a fragment to the database
 * @param {Object} params  The tag info.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function addFragment(params, config, conn) {

  // validate
  if (!params.id || params.id === '') {
    return 'You must enter a valid id'
  }

  // defaults
  config = config || require('../config/config.js')

  debug(params)

  // main
  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = 'INSERT into Fragment values (:id, :start, :end, NULL, NOW())'
    debug(sql)

    conn.query(sql, { replacements: { "id" : params.id, "start" : params.start, "end" : params.end } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}

/**
 * Adds a tag and media
 * @param {Object} params  The tag info.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function addMediaTag(params, config, conn) {

  // validate
  if (!params.tag || params.tag === '') {
    return 'You must enter a valid tagname'
  }

  if (!params.uri || params.uri === '') {
    return 'You must enter a valid uri'
  }

  // defaults
  config = config || require('../config/config.js')

  debug(params)

  // main
  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = 'INSERT into MediaTag SELECT m.id as media_id, t.id as tag_id from Tag t, Media m where t.tag = :tag and m.uri = :uri '
    debug(sql)

    conn.query(sql, { replacements: { "tag" : params.tag, "uri" : params.uri } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}


/**
 * Inserts rating to the database
 * @param {Object} rating  The rating to add.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function insertRating(rating, config, conn) {


  // validate
  if (!rating.uri || rating.uri === '') {
    return 'You must enter a valid uri'
  }
  if (!rating.reviewer || rating.reviewer === '') {
    return 'You must enter a valid reviewer'
  }
  if (isNaN(rating.rating)) {
    return 'You must enter a valid rating'
  }

  // defaults
  config = config || require('../config/config.js')


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = 'INSERT into Rating values (NULL, :uri, :rating, NULL, :reviewer, NULL)'
    debug(sql)

    conn.query(sql, { replacements: { "uri" : rating.uri, "reviewer" : rating.reviewer, "rating" : rating.rating } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}


/**
 * Updates rating in the database
 * @param {Object} rating  The rating to add.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function updateRating(rating, config, conn) {

  // validate
  if (!rating.uri || rating.uri === '') {
    return 'You must enter a valid uri'
  }
  if (!rating.reviewer || rating.reviewer === '') {
    return 'You must enter a valid reviewer'
  }
  if (isNaN(rating.rating)) {
    return 'You must enter a valid rating'
  }

  // defaults
  config = config || require('../config/config.js')


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = 'UPDATE Rating set rating = :rating where reviewer = :reviewer and uri = :uri'
    conn.query(sql, { replacements: { "uri" : rating.uri, "reviewer" : rating.reviewer, "rating" : rating.rating } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}


/**
 * Updates rating in the database
 * @param {Object} rating  The rating to add.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function updateLastSeen(params, config, conn) {

  // validate
  if (!params.uri || params.uri === '') {
    return 'You must enter a valid uri'
  }

  // defaults
  config = config || require('../config/config.js')


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = 'UPDATE Media set lastSeen = NOW() where uri = :uri'
    conn.query(sql, { replacements: { "uri" : params.uri } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}




/**
 * Updates rating in the database
 * @param {Object} rating  The rating to add.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function rateLastSeen(params, config, conn) {

  // validate
  if ( params.rating === null || params.rating === undefined ) {
    return 'You must enter a valid rating'
  }

  // defaults
  config = config || require('../config/config.js')


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    getLastSeen(params, config.con).then(function(res) {
      var row = res.ret[0][0]
      debug(row)
      if (row.contentType) {
        var sql = 'UPDATE Media set rating = :rating where id = :id'
      } else {
        var sql = 'UPDATE Fragment set rating = :rating where id = :id and start = :start'
      }
      debug(sql)
      return conn.query(sql, { replacements: { "rating" : params.rating, "id" : row.id, "start" : row.start } })
    }). then(function(ret) {
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}




/**
 * Get the top images
 * @param {Object} rating  The rating to add.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function getTopImages(params, config, conn) {


  // defaults
  config = config || require('../config/config.js')

  var limit = 10
  if (!isNaN(params.limit)) {
    limit = params.limit
  }


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql
    if (params.reviewer) {
      sql = 'SELECT * from Rating where reviewer = :reviewer order by rating DESC LIMIT :limit '
    } else {
      sql = 'SELECT uri, avg(rating) rating from Rating group by uri order by rating DESC LIMIT :limit '
    }

    conn.query(sql, { replacements: { "reviewer" : params.reviewer, "limit" : params.limit } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}


/**
 * Get list of tags
 * @param {Object} params  Info about tags.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function getTags(params, config, conn) {


  // defaults
  config = config || require('../config/config.js')

  params.limit = 100


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    if (params.uri) {
      var sql = 'SELECT t.tag from Media m left join MediaTag mt on m.id = mt.media_id left join Tag t on mt.tag_id = t.id  where m.uri = :uri order by t.tag LIMIT :limit '
    } else {
      var sql = 'SELECT * from Tag order by id LIMIT :limit '
    }
    debug(sql)

    conn.query(sql, { replacements: { "limit" : params.limit, "uri" : params.uri } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}


/**
 * Get the rating
 * @param {Object} rating  The rating to add.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function getRating(params, config, conn) {

  // validate
  if (!params.uri || params.uri === '') {
    return 'You must enter a valid uri'
  }
  if (!params.reviewer || params.reviewer === '') {
    return 'You must enter a valid reviewer'
  }


  // defaults
  config = config || require('../config/config.js')

  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = 'SELECT * from Rating where reviewer = :reviewer and uri = :uri order by rating LIMIT 1 '
    debug(sql)
    debug(params)

    conn.query(sql, { replacements: { "reviewer" : params.reviewer, "uri" : params.uri, "limit" : params.limit } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}



/**
 * Get a random image
 * @param {Object} rating  The rating to add.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function getRandomImage(params, config, conn) {


  // defaults
  config = config || require('../config/config.js')


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = "SELECT * from Media m where contentType = 'image' order by RAND() LIMIT 1"

    conn.query(sql, { replacements: {  } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}

/**
 * Get a random unseen image
 * @param {Object} rating  The rating to add.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function getRandomUnseenImage(params, config, conn) {



  // defaults
  config = config || require('../config/config.js')


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = "SELECT * from Media m where contentType = 'image' and lastSeen is not NULL order by RAND() LIMIT 1"

    conn.query(sql, { replacements: {  } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}

/**
 * Get a random unseen fragment
 * @param {Object} rating  The rating to add.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function getRandomUnseenFragment(params, config, conn) {



  // defaults
  config = config || require('../config/config.js')


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = "select a.uri, a.id id, contentType from Media a left join Fragment f on a.id = f.id where contentType = 'video' and f.id is null order by RAND()  limit 1"

    conn.query(sql, { replacements: {  } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}

/**
 * Get get the last fragment seen
 * @param {Object} rating  The rating to add.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function getLastFragment(params, config, conn) {



  // defaults
  config = config || require('../config/config.js')


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = "select a.uri, a.id id, f.end, contentType from Media a left join Fragment f on a.id = f.id where contentType = 'video' order by f.lastSeen desc limit 1"

    conn.query(sql, { replacements: {  } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}

/**
 * Get get the last seen item
 * @param {Object} rating  The rating to add.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function getLastSeen(params, config, conn) {


  // defaults
  config = config || require('../config/config.js')


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = "select * from Fragment order by lastSeen desc LIMIT 1;"
    var fragLastSeen
    var mediaLastSeen
    var val

    conn.query(sql, { replacements: {  } }).then(function(frag){
      var sql = "select * from Media order by lastSeen desc LIMIT 1;"
      debug(frag)
      val = frag
      fragLastSeen = frag[0][0].lastSeen
      debug(fragLastSeen)
      return conn.query(sql, { replacements: {  } })
    }).then(function(media) {
      debug(media)
      mediaLastSeen = media[0][0].lastSeen
      debug(mediaLastSeen)
      if (mediaLastSeen > fragLastSeen) {
        debug('media is latest : ' + media.lastSeen)
        return resolve({"ret" : media, "conn" : conn})
      } else {
        debug('frag is latest : ' + media.lastSeen)
        return resolve({"ret" : val, "conn" : conn})
      }
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}



/**
 * Get get a random rated fragment
 * @param {Object} rating  The rating to add.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function getRatedFragment(params, config, conn) {



  // defaults
  config = config || require('../config/config.js')


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = "select a.uri, a.id, max(f.end) end, a.contentType, max(f.rating) mrat from Media a , Fragment f where a.id = f.id and contentType = 'video' group by f.id having mrat >= 9 order by RAND()  limit 1"

    conn.query(sql, { replacements: {  } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}


/**
 * Search
 * @param {Object} rating  The rating to add.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function search(params, config, conn) {


  if (!params.q && !params.tag) {
    return 'You must enter a valid query or tag'
  }


  // defaults
  config = config || require('../config/config.js')


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    limit = params.limit || 1000

    if (params.q) {
      var sql = "SELECT * from Media m where uri like '%" + params.q + "%' order by rating desc LIMIT 1000"
    }
    if (params.tag) {
      var sql = 'SELECT uri from Media m left join MediaTag mt on m.id = mt.media_id left join Tag t on mt.tag_id = t.id  where t.tag = :tag order by t.tag LIMIT :limit '
    }

    conn.query(sql, { replacements: { "tag" : params.tag, "limit" : limit } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}
