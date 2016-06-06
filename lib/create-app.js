module.exports = createApp

var express = require('express')
var session = require('express-session')
var uuid = require('node-uuid')
var cors = require('cors')
var vhost = require('vhost')
var path = require('path')
var WcMiddleware = require('wc_express').middleware
var Sequelize  = require('sequelize')
var express    = require('express')
var program    = require('commander')
var bodyParser = require('body-parser')
var https      = require('https')
var fs         = require('fs')
var debug      = require('debug')('qpm_media:create-app')


var addmedia    = require('./handlers/addmedia')
var balance     = require('qpm_balance').handlers.balance
var home        = require('./handlers/home')
var random_rate = require('./handlers/random_rate')
var rate        = require('./handlers/rate')
var top         = require('./handlers/top')

var wc_db = require('wc_db')

var corsSettings = cors({
  methods: [
    'OPTIONS', 'HEAD', 'GET', 'PATCH', 'POST', 'PUT', 'DELETE'
  ],
  exposedHeaders: 'User, Location, Link, Vary, Last-Modified, ETag, Accept-Patch, Updates-Via, Allow, Content-Length',
  credentials: true,
  maxAge: 1728000,
  origin: true
})

function createApp (argv, sequelize, config) {
  var app = express()

  // Session
  var sessionSettings = {
    secret: uuid.v1(),
    saveUninitialized: false,
    resave: false
  }
  sessionSettings.cookie = {
    secure: true
  }

  app.use(session(sessionSettings))
  app.use('/', WcMiddleware(corsSettings))

  app.use( bodyParser.json() )       // to support JSON-encoded bodies
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }))

  var config = require('../config/config')
  sequelize = wc_db.getConnection(config.db)

  debug(config)


  app.use(function(req,res, next) {
    res.locals.sequelize = sequelize
    res.locals.config = config
    next()
  })

  app.set('view engine', 'ejs')

  config.ui = config.ui || {}
  config.ui.tabs = [
    {"label" : "Home", "uri" : "/"},
    {"label" : "Balance", "uri" : "/balance"},
    {"label" : "Content", "uri" : "/random_rate"},
    {"label" : "Rate", "uri" : "/rate"},
    {"label" : "Top", "uri" : "/top"}
  ]
  config.ui.name = "Media"


  app.post('/addmedia', addmedia)
  app.get('/balance', balance)
  app.get('/random_rate', random_rate)
  app.all('/rate', rate)
  app.get('/top', top)
  app.get('/', home)

  return app
}
