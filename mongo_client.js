
	var dotenv = require('dotenv');
	dotenv.load();
	var uri = JSON.stringify(process.env.MONGODB_URI);
	var MongoClient = require("mongodb").MongoClient;
	var db;
	module.exports = {
		connect: function(uri, callback) {
			MongoClient.connect(uri, function (err, database) {
				db = database;
				if(callback) {callback();}
			});
		},
		db: function(){
			return db;
		},
		close: function(){
			db.close();
		}
	};
