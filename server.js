var express = require("express");
var path = require("path");
var dotenv = require('dotenv');
var bodyParser = require("body-parser");
//var mongodb = require("mongodb");
var mongoose = require("mongoose");
var session = require('express-session');
//var mongo = require('./mongo_client.js');
var MongoStore = require('connect-mongo')(session);
var User = require('./models/user');
/*var fs = require('pn/fs');
var D3Node = require('./d3-node.js');
var d3 = require('d3'),
	q = require("d3-queue");
var jsdom = require("jsdom");
var markup = '<div id="chart"></div>';
var document = jsdom.jsdom()
var svg = d3.select(document.body);//.append("svg");
var d3_scale = require('d3-scale');
//d3.select(d3n.document.body).append('span');
var svg2png = require('svg2png');
//var styles = JSON.stringify("");

//import * as d3 from "d3";
var options = {selector:'#chart', container:markup};
var d3n = new D3Node(options);
//d3n.html();
var svg = d3n.createSVG().append('g')
//var q = d3.queue();

//var drawGraph = require
 
//d3.select(document.body).append('svg')
*/
var pug = require('pug');
var app = express();
dotenv.load();

mongoose.connect(process.env.DEVDB);
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

// make user ID available in templates
//var user_id;
app.use(function (req, res, next) {
  	res.locals.currentUser = req.session.userId;
	//var user_id = res.locals.currentUser;
/*	if (user_id) {
		User.findOne({_id: user_id}, 'polls votes', function(error, userData){
			if (error) {
				return next(error);
			} else {
				//var graphRender = require('./graph_render.js').graphRender(userData, d3n);
				//svg.innerHTML(graphRender);
				/*
				d3.queue()
				    .defer(graphRender)
				    .await(function(error) {
				      if (error) throw error;
				      console.log("Goodbye!");
				    });
				*/
				//return require('./graph_render.js')(userData, d3n);
/*			}		
		});
	}*/
  	next();
	
});



app.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(urlencodedParser);


app.use(express.static(__dirname + '/public'));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//routes
var index = require('./index');
app.use('/', index);

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
