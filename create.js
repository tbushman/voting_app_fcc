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

