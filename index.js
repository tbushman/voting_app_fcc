var express = require("express");
var router = express.Router();
var multer  = require('multer');
var dotenv = require('dotenv');
//var jsdom = require("jsdom");
//var document = jsdom.jsdom();
//var svg = d3.select(document.body).append('svg');
var User = require('./models/user');

var upload = multer();


dotenv.load();

/* GET login page. */
router.get('/login', function(req, res) {
	return res.render('login', {
		title: 'FCC Voting App'
	});
});

/* LOGIN process */
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

/* INIT signup */
router.post('/go', function(req, res, next){
	return res.redirect('/signup');
});

/* GET signup page */
router.get('/signup', function(req, res, next){
	return res.render('signup', {
		title: 'FCC Voting App'
	});
});

/* signup process */
router.post('/signup', upload.array(), function(req, res, next){
	var usern = req.body.user;
	var passw = req.body.pass;
	//console.log(req.body)
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
	if (req.session !== undefined) {
		var user_id = req.session.userId;
		console.log(user_id)
		User.findOne({_id: user_id}, 'votes polls', function(error, usr){
			if (error) {
				return next(error);
			} else {
				if (usr.votes !== [] && usr.votes[0].poll !== undefined) {
					console.log(usr.polls[0].poll_q, usr.votes[0].poll)
					return res.render('poll', {
						title: 'FCC Voting App',
						text: usr.polls[0].poll_q,
						data: usr.votes[0].poll //?
					});					
				} else {
					return res.render('index', {
						title: 'FCC Voting App'
					});
				}
			}
		});		
	} else {
		return res.render('index', {
			title: 'FCC Voting App'
		});
	}
});

/* INIT login page */
router.post('/', function(req, res, next){
	return res.redirect('/login');
});

/* GET polls page */
/*router.get('/vote', function(req, res, next) {
	return res.render('vote', {
		title: 'FCC Voting App'
	});
});
*/
/* GET create page */
router.get('/create', function(req, res, next){
	var user_id = req.session.userId;
	User.findOne({_id: user_id}, 'user', function(error, usr){
		if (error) {
			return next(error);
		} else {
			return res.render('create', {
				title: 'FCC Voting App',
				greet: usr.user,
				result: 'Hello'+usr.user+'! Create your poll'
			});						
		}
	})
});

/* create poll process */
router.post('/create', upload.array(), function(req, res, next){
	//console.log(req.session.userId)
	//console.log(req.body.poll_q)
	var user_id = req.session.userId;
	var poll_q = req.body.poll_q;
	var ans_a = req.body.ans_a;
	var ans_b = req.body.ans_b;
	
	var updateData = {
		_id: user_id,
		poll_q: poll_q,
		ans_a: ans_a,
		ans_b: ans_b
	}
	var data = {
		_id: updateData._id,
		poll: [
			{
				name: updateData.ans_a,
				value: 0
			},
			{
				name: updateData.ans_b,
				value: 0			
			}
		]
	}
	User.findOneAndUpdate(
		{_id: user_id},
		{$push: {"polls": updateData, "votes": data}},
		{safe: true, upsert: true, new: true},
		function(error, user){
			console.log(error)
		}
	);
	/*return res.render('poll', {
		title: 'FCC Voting App',
		text: updateData.poll_q,
		data: data //?
	});	*/
	return res.redirect('/');					
	
});
/*
router.get('/poll', function(req, res, next){

	var user_id = req.session.userId;
	User.findOne({_id: user_id}, 'polls votes', function(error, userData){
		if (error) {
			return next(error);
		} else {
			//return require('./graph_render.js')(userData, d3n);
		}		
	});
	
})
*/

module.exports = router;
