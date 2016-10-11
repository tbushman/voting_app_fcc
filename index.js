var express = require("express");
var router = express.Router();
var multer  = require('multer');
var dotenv = require('dotenv');
var User = require('./models/user')
var upload = multer();
dotenv.load();

/* GET login page. */
router.get('/login', function(req, res) {
	return res.render('login', {
		title: 'FCC Voting App'
	});
});
//var thisUser;
router.post('/login', upload.array(), function(req, res, next){
	var usern = req.body.user;
	var passw = req.body.pass;
	if (usern && passw) {
		User.authenticate(usern, passw, function(error, user){
			if (error || !user) {
	    		var err = new Error('Wrong email or password.');
	      		err.status = 401;
	        	return next(err);
	      	}  else {
	        	req.session.userId = user._id;
	        	return res.redirect('/create');
	      	}
		})
		//db.collection(COLLECTION_NAME).findOne({ user: usern }, function (err, nameExists) {
			//console.log(thisUser)
			//return res.redirect('/create')
	    //});
	} else {
	    var err = new Error('Email and password are required.');
	    err.status = 401;
	    return next(err);
	}
});

router.post('/go', function(req, res, next){
	return res.redirect('/signup');
});


router.get('/signup', function(req, res, next){
	return res.render('signup', {
		title: 'FCC Voting App'
	});
});

router.post('/signup', upload.array(), function(req, res, next){
	var usern = req.body.user;
	var passw = req.body.pass;
	console.log(req.body)
	if (usern && passw) {
		
		var usr = {
			user: usern,
			pass: passw
		};
		User.create(usr, function(error, user){
			if (error) {
				return next(error);
			} else {
				return res.redirect('/create')
			}
		})
			/*db.collection(COLLECTION_NAME).insertOne(usr, function (err, inserted) {
		  		if (err) return callback(err);
			});*/
			//thisUser = usr.user;
	} else {
		var err = new Error('All fields required.');
      	err.status = 400;
      	return next(err);
	}
	//add all fields required
});

/* GET home page. */
router.get('/', function(req, res, next) {
	return res.render('index', {
		title: 'FCC Voting App'
	});
});

router.post('/', function(req, res, next){
	return res.redirect('/login');
});

/* GET polls page */
router.get('/vote', function(req, res, next) {
	return res.render('vote', {
		title: 'FCC Voting App'
	});
});

/* GET create page */
router.get('/create', function(req, res, next){
	//req.session.userId
	return res.render('create', {
		title: 'FCC Voting App'//,
//		user: thisUser,
//		result: 'Hello'+thisUser+'! Create your poll'
	});			
});

module.exports = router;
