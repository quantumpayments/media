module.exports = {
  setupDB : setupDB
}

// Requires
var Sequelize = require('sequelize')

/**
* Setup database.
* @param  {Object} config          The config object.
* @param  {string} config.dialect  The db dialect sqlite | mysql.
* @param  {string} config.host     The db host.
* @param  {string} config.database The db database name.
* @param  {string} config.username The db username.
* @param  {string} config.password The db password.
* @return {Object}                    Sequelize db object.
*/
function setupDB(config) {
  var sequelize
  var defaultStorage = 'store.db'
  var logging = config.logging || false

  if (config.dialect === 'sqlite') {
    if (!config.storage) {
      config.storage = defaultStorage
    }

    sequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      dialect: config.dialect,
      storage: config.storage,
      logging: logging
    })
  } else {
    sequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      dialect: config.dialect,
      logging: logging
    })
  }
  return sequelize
}
