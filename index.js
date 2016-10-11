var express = require("express");
var router = express.Router();
var multer  = require('multer');
var dotenv = require('dotenv');
//var _ = require('underscore');
//var path = require("path");
//var logger = require('morgan');
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var mongoose = require("mongoose");
var Schema = require('./models/schema.js')
//var mid = require('./middleware');
//var mongo = require('./mongo_client.js');
var url = require('url');
//var jwt = require('express-jwt');
//var cors = require('cors');
//var http = require('http');
//var bcrypt = require('bcryptjs');
var upload = multer();
dotenv.load();

//var uri = process.env.MONGODB_URI;
var COLLECTION_NAME = 'fcc_voters_local'; //for local dev
//var COLLECTION_NAME = 'fcc_voters'; //for heroku deploy
var uri = process.env.DEVDB;
var db;
/*mongo.connect(uri, function(database){
	db = database;
	console.log('connected to MongoDB');
});*/
/*
mongodb.MongoClient.connect(uri, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");
});
*/
// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
	console.log("ERROR: " + reason);
	res.status(code || 500).json({"error": message});
}

//router.use('/login', require('./login.js'));

/* GET login page. */
router.get('/login', function(req, res) {
	return res.render('login', {
		title: 'FCC Voting App'
	});
});
var thisUser;
router.post('/login', upload.array(), function(req, res){
	var usern = req.body.user;
	var passw = req.body.pass;
	db.collection(COLLECTION_NAME).findOne({ user: usern }, function (err, nameExists) {
		if (err) return callback(err);
		if (nameExists) {
			thisUser = nameExists.user;
			return res.redirect('/create')
		} else {			
			var usr = {
				user: usern,
				pass: passw
			};
			
			Schema.user_schema.create(usr, function(err, user){
				if (err) {
					return callback(err);
				} else {
					return res.redirect('/create')
				}
			})
	    	/*db.collection(COLLECTION_NAME).insertOne(usr, function (err, inserted) {
	      		if (err) return callback(err);
	    	});*/
			thisUser = usr.user;
		}
		//console.log(thisUser)
		//return res.redirect('/create')
    });
});


/* GET home page. */
router.get('/', function(req, res) {
	return res.render('index', {
		title: 'FCC Voting App'
	});
});

/* GET polls page */
router.get('/vote', function(req, res) {
	return res.render('vote', {
		title: 'FCC Voting App'
	});
});

/* GET create page */
router.get('/create', function(req, res, next){
	//req.session.userId
	return res.render('create', {
		title: 'FCC Voting App',
		user: thisUser,
		result: 'Hello'+thisUser+'! Create your poll'
	});			
})

module.exports = router;
