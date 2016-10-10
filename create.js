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

//var uri = process.env.MONGODB_URI; //for heroku deploy
var uri = process.env.DEVDB;
var COLLECTION_NAME = 'fcc_voters_local'; //for local dev
//var COLLECTION_NAME = 'fcc_voters'; //for heroku deploy

mongodb.MongoClient.connect(uri, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
	console.log("ERROR: " + reason);
	res.status(code || 500).json({"error": message});
}
//bcrypt


router.post('/', upload.array(), function(req, res){
	var poll_q = req.body.poll_q;
	var ans_a = req.body.ans_a;
	var ans_b = req.body.ans_b;
});

