var express = require("express");
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

var pug = require('pug');

var app = express();
dotenv.load();

app.use(express.static(__dirname + '/public'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(urlencodedParser);

app.use('/', require('./index.js'));
app.use('/users', require('./users.js'));
//app.use('/history', require('./history.js'));
app.post('/', require('./search.js'));

var server = app.listen(process.env.PORT || 8080, function(){
	var port = server.address().port;
	console.log('App now running on port', port);
});
