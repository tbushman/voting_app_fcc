var express = require("express");
var dotenv = require('dotenv');
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var mongoose = require("mongoose");
var session = require('express-session');
//var mongo = require('./mongo_client.js');
var bcrypt = require('bcryptjs');

var pug = require('pug');

var app = express();
dotenv.load();

mongoose.connect(process.env.DEVDB)
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// use sessions for tracking logins
app.use(session({
  secret: 'treehouse loves you',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

app.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(urlencodedParser);

// make user ID available in templates
app.use(function (req, res, next) {
  res.locals.currentUser = req.session.userId;
  next();
});

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//routes
var index = require('./index.js');
//var login = require('./login.js');
//var create = require('./create.js');
//var vote = require('./vote.js');

//app.use(app.router);
app.use('/', index);
//app.use('/login', login);
//app.use('/create', create);
//app.post('/', login);
//app.post('/create', create);
//app.post('/vote', vote);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var server = app.listen(process.env.PORT || 8080, function(){
	var port = server.address().port;
	console.log('App now running on port', port);
});
