var express = require("express");
var router = express.Router();
var multer  = require('multer');
var dotenv = require('dotenv');
var User = require('../models/user');
var upload = multer();

dotenv.load();

// Authorization
var authorize = function(req, res, next) {
  	if (req.session/* && req.session.admin*/) {
    	return next();
	} else {
    	return res.sendStatus(401);
	}
};


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
		});
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
	return res.render('signup');
});

/* signup process */
router.post('/signup', upload.array(), function(req, res, next){
	var usern = req.body.user;
	var passw = req.body.pass;
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
		});
	} else {
		var err = new Error('All fields required.');
      	err.status = 400;
      	return next(err);
	}
});

/* GET logout route. */
router.get('/logout', function(req, res, next) {
  	req.session.destroy();
  	res.redirect('/');
});

/* GET home page. */
router.get('/',  function(req, res, next){
	User.aggregate([
	    { 
			$project: { _id: 0, polls: 1 } 
		}
	], function(err, data) {
	  	//console.log(JSON.stringify(data[0].polls));
		if (err) {
			return next(err);
		} else {
			return res.render('index', {
				polls: data[0].polls
			});
		}
	});
});


/* GET poll page */
router.get('/polls/:id/:index', function(req, res, next) {
	var index = req.params.index;
  	if (!req.params.id) {
		return next(new Error('No poll id.'));
	}
  	User.findOne({'polls[req.params.index]._id': req.params.id}, function(error, poll) {
    	if (error) {
			return next(error);
		}
    	if (!poll.published/* && !req.session.admin*/) {
			return res.sendStatus(401);
		}
    	res.render('poll', poll);
  	});
});

router.all('/api', authorize);


/* GET users API */
router.get('/api/users', function(req, res, next) {
	User.list(function(error, users) {
    	if (error) return next(error);
    	res.send({users: users});
  	});
});

/* GET polls API */
router.get('/api/polls', function(req, res, next) {
	User.aggregate([
	    { 
			$project: { _id: 0, polls: 1 } 
		}
	], function(err, data) {
	  	//console.log(JSON.stringify(data[0].polls));
		if (err) {
			return next(err);
		} else {
			return res.send({
				polls: data[0].polls
			});
		}
	});
});


/* POST poll API */
router.post('/api/polls', function(req, res, next) { //see admin.pug
	var user_id = req.session.userId;
	if (!req.body.poll) {
		return next(new Error('No poll data.'));
	}
  	var poll = req.body.poll;
  	poll.published = false;
	User.findOneAndUpdate(
		{_id: user_id},
		{$push: {"polls": poll}},
		{safe: true, upsert: true, new: true},
		function(error, data){
			console.log(data)
			res.send(data);
		}
	);
});


/* PUT poll API */
router.put('/api/polls/:id', function(req, res, next) {
	var user_id = req.session.userId;
	if (!req.params.id) {
		return next(new Error('No article ID.'));
	}
	User.findOneAndUpdate(
		{_id: user_id},
		{$push: {"polls": {_id: req.params.id}}},
		//count: { $sum: 1 }
		{safe: true, upsert: true, new: true},
		function(error, count, data){
			if (error) {
				return next(error);
			}
	      	res.send({affectedCount: count});
			//console.log(data)
			//res.send(data);
		}
	);
});


/* DELETE poll API */
router.delete('/api/polls/:id', function(req, res, next) {
	var user_id = req.session.userId;
	if (!req.params.id) {
		return next(new Error('No poll ID.'));
	}
	User.findOneAndUpdate(
		{_id: user_id},
		{$pull: {"polls": {_id: req.params.id}}},
		{multi: true, safe: true, upsert: true, new: true},
		function(error, data){
			console.log(data)
			res.send(data);
		}
	);
});

router.post('/create/poll_a/:index', function(req, res){
	var index = req.params.index; 
	//var html = '<div class="input-group" id="'+index+'"><input class="form-control" type="text" name="ans_'+index+'""></input><span class="input-group-btn"><button class="btn btn-danger remove" id="'+index+'">x</button></span></div>';
	//res.json(html);
	res.render('poll_a', {
		index: index
	})
});

/* GET create page */
router.get('/create', function(req, res, next){
	if (req.session/* && req.session.admin*/) {
 		var user_id = req.session.userId;
		User.findOne({_id: user_id}, 'user', function(error, usr){
			if (error) {
				return next(error);
			} else {
				return res.render('create', {
					greet: usr.user,
					result: 'Hello'+usr.user+'! Create your poll'
				});						
			}
		})
	} else {
    	return res.sendStatus(401);
	}
});

/* create poll process */
router.post('/create', upload.array(), function(req, res, next){
	if (req.session/* && req.session.admin*/) {
		var user_id = req.session.userId;
		var poll_q = req.body.poll_q;
		var answers = [];
		var keys = Object.keys(req.body);
		keys.shift(); // remove poll_q
		for (var i = 0; i < keys.length; i++) {
			var ans = req.body[keys[i]];
			var value = 0;
			answers.push({name: ans, value: value});
		}
		var index;
		User.count(function(err, cnt){
			index = cnt-1;
		});
		var data = {
			_id: user_id,
			poll_q: poll_q,
			poll_a: answers,
			index: index
		}
		User.findOneAndUpdate(
			{_id: user_id},
			{$push: {"polls": data}},
			{safe: true, upsert: true, new: true},
			function(error, user){
				console.log(error)
			}
		);
		return res.redirect('/');					
	} else {
    	return res.sendStatus(401);
	}	
});



/* GET admin page */
router.get('/admin', authorize, function(req, res, next) {
	User.aggregate([
	    { 
			$project: { polls: 1 } 
		}, 
		{ 
			$unwind: '$polls' 
		}, 
		{ 
			$group: {  
	        	_id: '$_id',
	 			count: { $sum: 1 }
	    	}
		}
	], function(err, polls) {
	  	//console.log(polls);	
		if (err) {
			return next(err);
		} else {
			return res.render('admin', {
				polls: polls
			});
		}
	});
});

module.exports = router;



// Pages and routes
//app.get('/', routes.index);
//app.get('/login', routes.user.login);
//**app.post('/login', routes.user.authenticate);
//app.get('/logout', routes.user.logout); //if you use everyauth, this /logout route is overwriting by everyauth automatically, therefore we use custom/additional handleLogout
//app.get('/admin', authorize, routes.poll.admin);
//app.get('/post', authorize, routes.poll.post);
//app.post('/post', authorize, routes.poll.postArticle);
//app.get('/polls/:slug', routes.poll.show);

// REST API routes
//app.all('/api', authorize);
//app.get('/api/polls', routes.poll.list);
//app.post('/api/polls', routes.poll.add);
//app.put('/api/polls/:id', routes.poll.edit);
//app.del('/api/polls/:id', routes.poll.del);

