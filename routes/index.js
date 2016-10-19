var express = require("express");
var router = express.Router();
var multer  = require('multer');
var dotenv = require('dotenv');
//var models = require('../models/index');
var User = require('../models/user');
var Poll = require('../models/poll')
var upload = multer();

dotenv.load();

/*router.use(function(req, res, next) {
	if (!Poll || !User) return next(new Error("No "))
	models = models;
	return next();
});*/

// Middleware
var authorize = function(req, res, next) {
  	if (req.session.userId) {
    	return next();
	} else {
    	return res.sendStatus(401);
	}
};

var loggedOut = function(req, res, next) {
	if (req.session.userId) {
		return res.redirect('/admin');
	}
	return next();
};

var hasVoted = function(req, res, next) {
	var voter_id = req.ip;
	var poll_id = req.body.poll_id;

	var index = req.body.index;
	var poll_q = req.body.poll_q;
	Poll.findOne({_id: req.body.poll_id, index: index}, function(err, docs){
		
		function myIndexOf(voter_id) {
			for (var i = 0; i < docs.voters.length; i++) {
				if (docs.voters[i].voter_id === voter_id) {
					return 1;
				}
			}  
			return -1;
		}
		var voterFilter = myIndexOf(voter_id);
		if (voterFilter != -1) {
			var err = new Error('You have already voted on that poll.');
	      	err.status = 400;
	      	return next(err);
		}
		return next();
	});	

};

/* GET login page. */
router.get('/login', loggedOut, function(req, res) {
	return res.render('login');
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
				//req.session.user = user;
				//req.session.admin = user.admin;
				return res.redirect('/admin');
				
	        	//return res.redirect('/create');
	      	}
		});
	} else {
	    var err = new Error('Email and password are required.');
	    err.status = 401;
	    return next(err);
	}
});

/* GET signup page */
router.get('/signup', loggedOut, function(req, res, next){
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
				return res.redirect('/admin')
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
	if (req.session) {
		req.session.destroy(function(err){
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});	  	
	}  	
});

/* GET home page. */
router.get('/',  function(req, res, next){
	Poll.find({}, function(err, docs) {
		if (err) {
			return next(err);
		} else {
			return res.render('index', {
				polls: docs
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
	var poll_id = req.params.id;
	Poll.findOne({_id: poll_id}, function(error, docs){
		if (error) {
			return next(error);
		} else {
			return res.render('poll', {
				_id: poll_id,
				index: index,
				poll_q: docs.poll_q,
				poll_a: docs.poll_a //array
			});						
		}
	})
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
	Poll.find({}, function(err, docs) {
		if (err) {
			return next(err);
		} else {
			return res.send({
				polls: docs
			});
		}
	});
});


/* POST poll API */
/*router.post('/api/polls', function(req, res, next) { //see admin.pug
	var user_id = req.session.userId;
	if (!req.body.poll) {
		return next(new Error('No poll data.'));
	}
  	var poll = req.body.poll;
	Poll.insert(poll, function(error, data){
			//console.log(data)
			res.send(data);
		}
	);
});*/

/* GET single poll API */
router.get('/api/polls/:id/:index', function(req, res, next){
	var user_id = req.session.userId;
	var index = req.params.index;
	var poll_id = req.params.id;
	//User.findOne({'polls[index]._id': req.params.id}, function(error, poll){
	Poll.findOne({user_id: user_id, index: index}, function(error, data){
		if (error) {
			return next(error);
		} else {
			return res.render('edit', {
				_id: poll_id,
				index: index,
				poll_q: data.poll_q,
				poll_a: user.poll_a //array
			});						
		}
	})
});

/* PUT edited poll API */
router.post('/api/polls/:id/:index', upload.array(), function(req, res, next) {
	var user_id = req.session.userId;
	var index = req.params.index;
	var poll_q = req.body.poll_q;
	var answers = [];
	var keys = Object.keys(req.body);
	keys.shift(); // remove poll_q
	for (var i = 0; i < keys.length; i++) {
		var ans = req.body[keys[i]];
		var value = 0;
		answers.push({name: ans, value: value});
	}
	Poll.findOneAndUpdate(
		{_id: req.params.id, index: index, user_id: user_id},
		{$set: {
			poll_q: poll_q,
			poll_a: answers
			}
		},
		//count: { $sum: 1 }
		{safe: true, upsert: false},
		function(error, data){
			if (error) {
				return next(error);
			}
		}
	);
	
	return res.redirect('/');					
	
});


/* DELETE poll API */
router.delete('/api/polls/:id/:index', function(req, res, next) {
	var user_id = req.session.userId;
	var poll_id = req.params.id;
	var index = req.params.index;
	if (!req.params.id) {
		return next(new Error('No poll ID.'));
	}
	Poll.remove(
		{_id: poll_id, index: index, user_id: user_id},
		{justOne: true},
		function(err, data){
			if (err) {
				return next(err);
			} else {
				return res.redirect('/admin');
			}
		}
	);
});

/* POST for empty poll_a */
router.post('/api/poll_a/:index', function(req, res){
	var index = req.params.index; 
	res.render('poll_a', {
		index: index
	})
});

/* GET create page */
router.get('/create', authorize, function(req, res, next){
	var user_id = req.session.userId;
	Poll.find({user_id: user_id}, function(error, docs){
		if (error) {
			return next(error);
		} else {
			User.findOne({_id: user_id}, function(err, data) {
				if (err) {
					return next(err)
				} else {
					return res.render('create', {
						greet: data.user,
						result: 'Hello'+data.user+'! Create your poll',
						polls: docs
					});						
				}				
			})
		}
	})
});

/* POST create poll process */
router.post('/create', authorize, upload.array(), function(req, res, next){
	var user_id = req.session.userId;
	var poll_q = req.body.poll_q;
	var answers = [];
	var keys = Object.keys(req.body);
	keys.shift(); // remove hidden input
	keys.shift(); //remove poll_q
	for (var i = 0; i < keys.length; i++) {
		var ans = req.body[keys[i]];
		var value = 0;
		answers.push({name: ans, value: value});
	}
	var index = req.body.index;
	var data = {
		user_id: user_id,
		poll_q: poll_q,
		poll_a: answers,
		index: index,
		voters: []
	}
	Poll.insert(data,
		function(error, docs){
			if (error) {
				return next(error);
			}
		}
	);
	return res.redirect('/');					
	
});

/* POST vote */
router.post('/vote', upload.array(), hasVoted, function(req, res, next){
	var user_ip = req.ip;
	var poll_id = req.body.poll_id;
	
	var index = req.body.index;
	var poll_q = req.body.poll_q;
	Poll.findOne({_id: req.body.poll_id, index: index}, function(err, data){
		//data = data[0]
		var vals = [];
		var names = [];
		var answers = data.poll_a;
		for (var i = 0; i < answers.length; i++) {
			vals.push(answers[i].value);
			names.push(answers[i].name);
		}
		var ans_ind = names.indexOf(req.body.checked);
		var checked_val = vals[ans_ind];
		checked_val++;
		data.poll_a[ans_ind].value = checked_val;
		data.voters.push({voter_id: user_ip});
		data.save(function(error){
			if(error) {
				console.log('error!')
			}
			console.log(data.poll_a[ans_ind].value)
			return res.redirect('/');
		});
	});
});

/* GET admin page */
router.get('/admin'/*, authorize*/, function(req, res, next) {
	User.findOne({_id: req.session.userId}, function(err, user) {
	  	//console.log(JSON.stringify(data[0].polls));
		if (err) {
			return next(err);
		} else {
			Poll.find({user_id: req.session.userId}, function(error, docs){
				if (error) {
					return next(error);
				} else {
					return res.render('admin', {
						polls: docs
					});
				}
			});
		}
	});
});

module.exports = router;

