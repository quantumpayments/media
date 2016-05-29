module.exports = createApp

var express = require('express')
var session = require('express-session')
var uuid = require('node-uuid')
var cors = require('cors')
var vhost = require('vhost')
var path = require('path')
var WcMiddleware = require('./WcMiddleware')
var Sequelize  = require('sequelize');
var express    = require('express');
var program    = require('commander');
var bodyParser = require('body-parser');
var https      = require('https');
var fs         = require('fs');
var wc         = require('../')

var pay        = require('./handlers/pay')
var balance    = require('./handlers/balance')
var faucet     = require('./handlers/faucet')
var addcredits = require('./handlers/addcredits')
var home       = require('./handlers/home')



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

  app.use(function(req,res, next) {
    res.locals.sequelize = sequelize;
    res.locals.config = config;
    next();
  });

  app.get('/pay', pay)
  app.get('/balance', balance)
  app.get('/faucet', faucet)
  app.post('/addcredits', addcredits)
  app.get('/', home)

  return app
}
