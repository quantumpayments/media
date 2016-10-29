module.exports = {
  addMedia                : addMedia,
  addMediaTag             : addMediaTag,
  addMeta                 : addMeta,
  addTag                  : addTag,
  addFragment             : addFragment,
  addRating               : addRating,
  createTables            : createTables,
  getLastFragment         : getLastFragment,
  getLastSeen             : getLastSeen,
  getRandomAudio          : getRandomAudio,
  getRandomImage          : getRandomImage,
  getRandomVideo          : getRandomVideo,
  getRandomUnseenImage    : getRandomUnseenImage,
  getRating               : getRating,
  getRandomUnseenFragment : getRandomUnseenFragment,
  getRatedFragment        : getRatedFragment,
  getTaggedFragment       : getTaggedFragment,
  getTags                 : getTags,
  getTopImages            : getTopImages,
  getUserId               : getUserId,
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

  var sql = fs.readFileSync('model/Meta.sql').toString()
  debug(sql)
  db.query(sql).then(function(ret){
    debug(ret)
  }).catch(function(err) {
    debug(err)
  })

  var sql = fs.readFileSync('model/User.sql').toString()
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
function addMedia(uri, contentType, safe) {
  if (!uri || uri === '') {
    return 'You must enter a valid uri'
  }
  safe = safe || 0
  return new Promise((resolve, reject) => {

    var config = require('../config/config.js')
    var conn = wc_db.getConnection(config.db)

    // sniff content type
    if (!contentType) {
      // image
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
      // video
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
      if (uri.indexOf('.m4v') !== -1) {
        contentType = 'video'
      }
      if (uri.indexOf('.mkv') !== -1) {
        contentType = 'video'
      }
      // audio
      if (uri.indexOf('.mp3') !== -1) {
        contentType = 'audio'
      }
      if (uri.indexOf('.ogg') !== -1) {
        contentType = 'video'
      }
      if (uri.indexOf('.flv') !== -1) {
        contentType = 'video'
      }
    }

    var sql = 'INSERT into Media values (NULL, :uri, NULL, NULL, NULL, :contentType, ' + safe + ')'

    conn.query(sql, { replacements: { "uri" : uri, "contentType" : contentType } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
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
      debug('addRating', 'updating instead of insert')
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
 * Adds a meta record to the database
 * @param {Object} params  The meta info.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function addMeta(params, config, conn) {

  params = params || {}

  // validate
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

    if (!params.subtitlesURI) {
      params.subtitlesURI = null
    }

    if (!params.charenc) {
      params.charenc = null
    }

    var sql = 'INSERT into Meta select a.id, :length, :subtitlesURI, :charenc from Media a where a.uri = :uri ;'
    debug('addMeta', sql, params)

    conn.query(sql, { replacements: { "length" : params.length, "subtitlesURI": params.subtitlesURI, "uri" : params.uri, "charenc" : params.charenc } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}

/**
 * Adds a fragment to the database
 * @param {Object} params  The parameter info.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function addFragment(params, config, conn) {

  // validate
  if ( (!params.id || params.id === '') && (!params.uri || params.uri === '') ) {
    return 'You must enter a valid id or uri'
  }

  // defaults
  config = config || require('../config/config.js')

  debug(params)

  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql
    if (params.id) {
      sql = 'INSERT into Fragment values (:id, :start, :end, NULL, NOW(), 1)'
    } else {
      sql = 'INSERT into Fragment Select m.id, :start, :end, NULL, NOW(), u.id from Media m, User u where m.uri = :uri and u.uri = :webid'
    }
    debug(sql)

    conn.query(sql, { replacements: { "id" : params.id, "start" : params.start, "end" : params.end, "uri" : params.uri, "webid" : params.webid } }).then(function(ret){
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
  if ( (!rating.uri || rating.uri === '') && (!rating.cacheURI || rating.cacheURI === '') ) {
    return 'You must enter a valid uri'
  }
  if (!rating.reviewer || rating.reviewer === '') {
    return 'You must enter a valid reviewer'
  }

  // defaults
  config = config || require('../config/config.js')


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql
    if (rating.uri) {
      sql = 'INSERT into Rating values (NULL, :uri, :rating, NULL, :reviewer, NULL, NOW())'
    } else {
      sql = 'INSERT into Rating SELECT NULL, a.uri, :rating, NULL, :reviewer, NULL, NOW() from Media a where a.cacheURI = :cacheURI '
    }
    debug('insertRating', sql, rating)

    conn.query(sql, { replacements: { "uri" : rating.uri, "cacheURI" : rating.cacheURI, "reviewer" : rating.reviewer, "rating" : rating.rating ? rating.rating : null } }).then(function(ret){
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

    var sql = 'UPDATE Rating r join User u on u.id = r.reviewer_id set r.rating = :rating where u.uri = :reviewer and r.uri = :uri'

    debug('updateRating', sql, rating)

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
  if (!params.uri && !params.cacheURI) {
    return 'You must enter a valid uri'
  }

  var reviewer = params.reviewer || 'http://melvincarvalho.com/#me'

  // defaults
  config = config || require('../config/config.js')

  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    getUserId({ "uri": reviewer}).then(function(ret){
      params.reviewer_id = ret.ret
      return params.reviewer_id
    }).then(function(reviewer_id){
      var sql
      if (params.uri) {
        sql = 'UPDATE Media set lastSeen = NOW() where uri = :uri'
      } else if (params.cacheURI) {
        sql = 'UPDATE Media set lastSeen = NOW() where cacheURI = :cacheURI'
      }
      debug('updateLastSeen', sql, params)

      return conn.query(sql, { replacements: { "uri" : params.uri, "cacheURI" : params.cacheURI } })
    }).then(function(ret) {

      var rating = {}
      rating.uri = params.uri
      rating.cacheURI = params.cacheURI
      rating.reviewer = params.reviewer_id
      debug(rating)
      return insertRating(rating, config, conn)
    }).then(function(ret) {
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

  var reviewer = params.reviewer || 1

  // defaults
  config = config || require('../config/config.js')


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }
    var datePublished
    var row

    getLastSeen(params, config.con).then(function(res) {
      row = res.ret[0][0]
      debug(row)
      datePublished = row.datePublished
      if (datePublished) {
        var sql = 'UPDATE Media set rating = :rating where id = :id'
      } else {
        var sql = 'UPDATE Fragment set rating = :rating where id = :id and start = :start'
      }
      debug('rateLastSeen', sql, params)

      return conn.query(sql, { replacements: { "rating" : params.rating, "id" : row.id, "start" : row.start } })

    }). then(function(ret) {
      if (datePublished) {
        var rating = {}
        rating.uri = row.uri
        rating.reviewer = reviewer
        rating.rating = params.rating
        debug('rateLastSeen', rating)
        return updateRating(rating, config, conn)
      } else {
        return 'done'
      }
    }).then(function(ret) {
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

    var sql = 'SELECT r.* from Rating r join User u on u.id = r.reviewer_id where u.uri = :reviewer and r.uri = :uri order by r.rating LIMIT 1 '
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
 * Get a random audio
 * @param {Object} rating  The rating to add.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function getRandomAudio(params, config, conn) {


  // defaults
  config = config || require('../config/config.js')


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = "SELECT * from Media m where contentType = 'audio' order by RAND() LIMIT 1"

    conn.query(sql, { replacements: {  } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}

/**
 * Get a random video
 * @param {Object} rating  The rating to add.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function getRandomVideo(params, config, conn) {


  // defaults
  config = config || require('../config/config.js')


  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = "SELECT * from Media m where contentType = 'video' order by RAND() LIMIT 1"

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

  params = params || {}

  var max = config.db.max || 0
  var optimization = config.optimization || 0
  var offset = Math.floor(Math.random() * max)

  params.optimization = optimization
  params.offset = offset

  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var safeClause = ''
    if (params.safe !== undefined && params.safe !== null) {
      if (parseInt(params.safe) === 0) {
        safeClause = ''
      } else {
        safeClause = ' and a.safe = :safe '
      }
    } else {
      safeClause = ' and a.safe = 1 '
    }

    if (params.reviewer) {
      var sql = "SELECT * from Media m where m.uri not in (select r.uri from Rating r join User u on u.id = r.reviewer_id) and contentType = 'image' and lastSeen is NULL " + safeClause + " and FLOOR( m.id / :optimization ) = FLOOR( RAND() * :optimization ) and m.id >= :offset LIMIT 1;"
    } else {
      var sql = "SELECT * from Media m where contentType = 'image' and lastSeen is NULL order by RAND() LIMIT 1;"
    }

    debug('getRandomUnseenImage', sql, params)

    conn.query(sql, { replacements: { "optimization" : params.optimization, "offset" : params.offset } }).then(function(ret){
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

    debug('getRandomUnseenFragment', params)

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var tagJoins = ''
    var tagClause = ''
    if (params.tag) {
      tagJoins = ' join MediaTag mt on mt.media_id = a.id join Tag t on t.id = mt.tag_id '
      tagClause = ' and tag = :tag '
    }

    var webidJoins = ''
    var webidClause = ''
    if (params.webid) {
      webidClause = ' where u.uri = :webid '
    }

    var safeClause = ''
    if (params.safe !== undefined && params.safe !== null) {
      if (parseInt(params.safe) === 0) {
        safeClause = ''
      } else {
        safeClause = ' and a.safe = :safe '
      }
    } else {
      safeClause = ' and a.safe = 1 '
    }

    var sql = "select a.uri, a.id id, f1.end, a.contentType, me.subtitlesURI, me.charenc from Media a left join Fragment f1 on f1.id = a.id left join Meta me on me.id = a.id " + tagJoins + " where a.contentType = 'video' " + tagClause + " and a.id not in (select f2.id from Fragment f2 join User u on u.id = f2.user_id " + webidClause + " ) " + safeClause + " order by RAND() limit 1;"

    debug('getRandomUnseenFragment', sql, params)

    conn.query(sql, { replacements: { "tag" : params.tag, "webid" : params.webid, "safe" : params.safe } }).then(function(ret){
      debug('success', ret)
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      debug('failure', err)
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
  params = params || {}
  config = config || require('../config/config.js')

  // main
  return new Promise((resolve, reject) => {
    debug('getLastFragment promise', params)

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var tagJoins = ''
    var tagClause = ''
    if (params.tag) {
      tagJoins = ' join MediaTag mt on mt.media_id = a.id join Tag t on t.id = mt.tag_id '
      tagClause = ' and tag = :tag '
    }

    var webidJoins = ''
    var webidClause = ''
    if (params.webid) {
      webidJoins = ' join User u on u.id = f.user_id '
      webidClause = ' and u.uri = :webid '
    }

    var safeClause = ''
    if (params.safe !== undefined && params.safe !== null) {
      if (parseInt(params.safe) === 0) {
        safeClause = ' and a.safe >= u.safe '
      } else {
        safeClause = ' and a.safe = :safe '
      }
    } else {
      safeClause = ' and a.safe = 1 '
    }

    var sql = "select a.uri, a.id id, f.end, a.contentType, me.subtitlesURI, me.charenc, a.safe media_safe, u.safe user_safe from Media a left join Fragment f on a.id = f.id left join Meta me on a.id = me.id " + tagJoins + webidJoins + " where contentType = 'video' " + safeClause + tagClause + webidClause + " order by f.lastSeen desc limit 1;"

    debug('getLastFragment', sql, params)

    conn.query(sql, { replacements: { "tag" : params.tag, "webid" : params.webid, "safe" : params.safe } }).then(function(ret){
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

  params = params || {}
  params.webid = params.webid || 'http://melvincarvalho.com/#me'

  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = "select f.* from Fragment f join User u on f.user_id = u.id where u.uri = :webid order by lastSeen desc LIMIT 1;"
    var fragLastSeen
    var mediaLastSeen
    var val

    debug('getLastSeen', sql, params)

    conn.query(sql, { replacements: { "webid" : params.webid } }).then(function(frag){
      var sql = "select r.* from Rating r join User u on u.id = r.reviewer_id and u.uri = :webid order by datePublished desc LIMIT 1;"
      debug('getLastSeen', sql, params)
      debug(frag)
      val = frag
      fragLastSeen = frag[0][0].lastSeen
      debug(fragLastSeen)
      return conn.query(sql, { replacements: { "webid" : params.webid } })
    }).then(function(media) {
      debug(media)
      mediaLastSeen = media[0][0].datePublished
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
    debug('getRatedFragment', params)

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var tagJoins = ''
    var tagClause = ''
    if (params.tag) {
      tagJoins = ' join MediaTag mt on mt.media_id = a.id join Tag t on t.id = mt.tag_id '
      tagClause = ' and tag = :tag '
    }

    var webidJoins = ''
    var webidClause = ''
    if (params.webid) {
      webidJoins = ' join User u on u.id = f.user_id '
      webidClause = ' and u.uri = :webid '
    }

    var safeClause = ''
    if (params.safe !== undefined && params.safe !== null) {
      if (parseInt(params.safe) === 0) {
        safeClause = ''
      } else {
        safeClause = ' and a.safe = :safe '
      }
    } else {
      safeClause = ' and a.safe = 1 '
    }

    var sql = "select a.uri, a.id, max(f.end) end, a.contentType, max(f.rating) mrat, m.subtitlesURI, m.charenc from Media a join Fragment f on  a.id = f.id join Meta m on m.id = a.id " + webidJoins + tagJoins + " where contentType = 'video' " + webidClause + tagClause + "   and end < m.length " + safeClause + " group by f.id having mrat >= 9 order by RAND() limit 1;"

    debug(sql)

    conn.query(sql, { replacements: { "tag" : params.tag, "webid" : params.webid, "safe" : params.safe } }).then(function(ret){
      debug('getRatedFragment', ret)
      return resolve({"ret" : ret, "conn" : conn})
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
function getTaggedFragment(params, config, conn) {

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

    var safeClause = ''
    if (params.safe !== undefined && params.safe !== null) {
      if (parseInt(params.safe) === 0) {
        safeClause = ''
      } else {
        safeClause = ' and a.safe = :safe '
      }
    } else {
      safeClause = ' and a.safe = 1 '
    }

    var sql = "select a.uri, a.id, max(f.end) end, a.contentType, max(f.rating) mrat, m.subtitlesURI, m.charenc from Media a, Fragment f, Meta m, Tag t, MediaTag mt where a.id = f.id and m.id = a.id and t.tag = :tag and t.id = mt.tag_id and a.id = mt.media_id and contentType = 'video' and end < m.length " + safeClause + " group by f.id order by RAND() limit 1"

    conn.query(sql, { replacements: { "tag" : params.tag } }).then(function(ret){
      return resolve({"ret" : ret, "conn" : conn})
    }).catch(function(err) {
      return reject({"err" : err, "conn" : conn})
    })

  })

}


/**
 * Get get a user id from uri
 * @param {Object} params  The parameters.
 * @param {Object} config  The optional config.
 * @param {Object} conn    The optional db connection.
 * @return {Object} Promise with success or fail.
 */
function getUserId(params, config, conn) {

  params = params || {}

  if (!params.uri || params.uri == '') {
    return 'You must enter a user uri'
  }

  // defaults
  config = config || require('../config/config.js')

  // main
  return new Promise((resolve, reject) => {

    if (!conn) {
      var conn = wc_db.getConnection(config.db)
    }

    var sql = "select u.id from User u where uri = :uri ;"

    debug('getUserId', sql, params)

    conn.query(sql, { replacements: { "uri" : params.uri } }).then(function(ret){
      var id = -1
      if (ret && ret[0] && ret[0][0] && ret[0][0].id) {
        id = ret[0][0].id
      }
      debug('getUserId', id)
      return resolve({"ret" : id, "conn" : conn})
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
