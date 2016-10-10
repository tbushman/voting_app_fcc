var express = require("express");
var router = express.Router();
var multer  = require('multer');
var dotenv = require('dotenv');
var _ = require('underscore');
var path = require("path");
var logger = require('morgan');
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var mongo = require('./mongo_client.js');
var url = require('url');
//var jwt = require('express-jwt');
var cors = require('cors');
var http = require('http');
//var bcrypt = require('bcryptjs');
var upload = multer();
dotenv.load();

var uri = process.env.MONGODB_URI;

mongo.connect(uri, function(){
	console.log('connected to MongoDB');
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
	console.log("ERROR: " + reason);
	res.status(code || 500).json({"error": message});
}


router.post('/', upload.array(), function(req, res){
	var usern = req.body.user;
	var passw = req.body.pass;
	create(res, usern, passw)
});

function create (usern, passw, callback) { //signup
//	var uri = process.env.MONGODB_URI;
//	mongo.connect(uri, function (db) {
	    

	 	//var salt = bcrypt.genSaltSync(10);
		mongo.db().collection('fcc_voters').findOne({ user: usern }, function (err, nameExists) {
			if (err) return callback(err);
			if (nameExists) {
				//return callback(new Error('the user already exists'));
				login(usern, passw);
				return false;
			}// else {			
				//bcrypt.hashSync(passw, salt, function (err, hash) {
		        //	if (err) { return callback(err); }
		        //	passw = bcrypt.hashSync(hash, salt);

					// Store hash in your password DB.				
					var usr = {
						user: usern,
						pass: passw
					}
		        	mongo.db().collection('fcc_voters').insertOne(usr, function (err, inserted) {
		          		if (err) return callback(err);
		          		callback(null);
		        	});
		    	//});
			//}
			return user;		
	    });
//	});
}

function login(callback) { //user / pass
	//mongo.connect(uri, function (db) {
		var usern = create().usr.user;
		var passw = create().usr.pass;
	    mongo.db().collection('fcc_voters').findOne({ user: usern }, function (err, usr) {
			if (err) return callback(err);

		      if (!user) return callback(new Error('Username not found'));
				//new WrongUsernameOrPasswordError(email));

		      //bcrypt.compare(passw, usr.pass, function (err, isValid) {
		        //if (err) {
				//	callback(err);
		        //} else if (!isValid) {
				//	callback(new Error('Wrong username or password'));
		        //} else {
		          	callback(null, {
		            	user: usr.user
		          	});
		        //}
			//});
	    });
//	});
}


/* GET home page. */
router.get('/', function(req, res) {
	var thisUser = login.user;
	if (thisUser == undefined) {
		res.render('index', {
			title: 'FCC Voting App'
		});
		return false;
	} else {
		res.render('index', {
			title: 'FCC Voting App',
			result: 'Hello'+login.user+'! You can now create a poll.'
		});		
	}
});

module.exports = router;
