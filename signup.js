var express = require('express');
var router = express.Router();
var dotenv = require('dotenv');
var _ = require('underscore');
var path = require("path");
var logger = require('morgan');
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var mongo = require('./mongo_client.js');
var url = require('url');
var jwt = require('express-jwt');
var cors = require('cors');
var http = require('http');
var bcrypt = require('bcryptjs');
dotenv.load();

var uri = process.env.MONGODB_URI;

mongo.connect(uri, function(){
	console.log('connected to MongoDB');
})

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
	console.log("ERROR: " + reason);
	res.status(code || 500).json({"error": message});
}
//bcrypt


router.post('/', upload.array(), function(req, res){
	var usern = req.body.user;
	var passw = req.body.pass;
	create(res, usern, passw)
});

function create (usern, passw, callback) { //signup
	mongo(uri, function (db) {
    var users = db.collection('fcc_voters');

 	var salt = bcrypt.genSaltSync(10);
	users.findOne({ user: usern }, function (err, nameExists) {
		if (err) return callback(err);
		if (nameExists) {
			//return callback(new Error('the user already exists'));
			login(usern, passw);
			return false;
		} else {			
			bcrypt.hashSync(passw, salt, function (err, hash) {
	        	if (err) { return callback(err); }
	        	passw = bcrypt.hashSync(hash, salt);
				
				// Store hash in your password DB.				
				var user = {
					user: usern,
					pass: passw
				}
	        	users.insert(user, function (err, inserted) {
	          		if (err) return callback(err);
	          		callback(null);
	        	});
	    	});
		}		
    });
	});
}

function login(usern, passw, callback) { //user / pass
	mongo(uri, function (db) {
	    var users = db.collection('fcc_voters');
	    users.findOne({ user: usern }, function (err, usr) {
			if (err) return callback(err);

		      if (!user) return callback(new Error('Username not found'));
				//new WrongUsernameOrPasswordError(email));

		      bcrypt.compare(passw, usr.pass, function (err, isValid) {
		        if (err) {
					callback(err);
		        } else if (!isValid) {
					callback(new Error('Wrong username or password'));
		        } else {
		          	callback(null, {
		            	user_id: usr._id.toString(),
		            	user: usr.user
		          	});
		        }
			});
	    });
	});
}




module.exports = router;

/*
function remove (id, callback) {
	mongo('mongodb://tbushman:wtfOMG520@ds053126.mlab.com:53126/heroku_t452bq5j', function (db) {
    	var users = db.collection('fcc_voters');
		users.remove({ _id: id }, function (err) {
      		if (err) return callback(err);
			callback(null);
  		});
	});
}
	function verify (email, callback) {
		mongo('mongodb://tbushman:wtfOMG520@ds053126.mlab.com:53126/heroku_t452bq5j', function (db) {
	    	var users = db.collection('fcc_voters');
	    	var query = { email: email, email_verified: false };
			
			users.update(query, { $set: { email_verified: true } }, function (err, count) {
				if (err) return callback(err);
				callback(null, count > 0);
			});
		});
	}

	function changePassword(email, newPassword, callback) {
		mongo('mongodb://tbushman:wtfOMG520@ds053126.mlab.com:53126/heroku_t452bq5j', function (db) {
	    	var users = db.collection('fcc_voters');

		    bcrypt.hash(newPassword, 10, function (err, hash) {
				if (err) {
		      		callback(err);
				} else {
		        	users.update({ email: email }, { $set: { password: hash } }, function (err, count) {
		          		if (err) return callback(err);
		          		callback(null, count > 0);
		        	});
		    	}
		    });
		});
	}
*/
