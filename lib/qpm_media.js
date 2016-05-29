module.exports = {
  createTables: createTables
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
