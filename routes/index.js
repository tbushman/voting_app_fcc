var express = require("express");
var router = express.Router();
var multer  = require('multer');
var dotenv = require('dotenv');
var User = require('../models/user');
var upload = multer();

dotenv.load();

// Middleware
var authorize = function(req, res, next) {
  	if (req.session && req.session.userId) {
    	return next();
	} else {
    	var err = new Error('You must be logged in to view this page.');
	    err.status = 401;
	    return next(err);
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
	User.findOne({_id: req.body.poll_id, 'polls.index': index}, function(err, data){
		//data = data[0];
		//console.log(data)
		function myIndexOf(voter_id) {
			if (data.polls.length === 0) {
				return -1;
			} else {
				for (var i = 0; i < data.polls.length; i++) {
					for (var j = 0; j < data.polls[i].voters.length; j++) {
						if (data.polls[i].voters[j].voter_id === voter_id) {
							return 1;
						}
					}
				}  
				return -1;
			}
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
				req.session.user = user;
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
	//console.log(req.locals.currentUser)
	if (usern && passw) {
		
		var usr = {
			user: usern,
			pass: passw
		};
		User.create(usr, function(error, user){
			if (error) {
				return next(error);
			} else {
				req.session.userId = user._id;
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
	User.find({}, function(error, docs){
		//console.log(docs)
		function myIndexOf(check_empty) {
			if (check_empty == null) {
				return -1
			}
			return 1
		}
		var emptyFilter = [];
		for (var i in docs) {
			var filter = myIndexOf(docs[i].polls[0])
			emptyFilter.push(filter);
		}
		
		if (emptyFilter.indexOf(1) === -1) {
			return res.render('index', {
				polls: []
			});
		} else {
			User.aggregate([ //get all polls from all users :D
			    { 
					$project: { polls: 1 } 
				},
				{
					$unwind:  '$polls' 
				},
				{
					$group: { _id: null, polls: {$push: '$polls'} }
				}
			], function(err, data) {
				if (err) {
					return next(err);
				} else {
					//console.log(data[0].polls)
					return res.render('index', {
						polls: data[0].polls
					});
				}
			});
		}
	})
});


/* GET poll page */ //Twitter link

router.get('/polls/:id/:index', function(req, res, next) {
	var index = req.params.index;
  	if (!req.params.id) {
		return next(new Error('No poll id.'));
	}
	var poll_id = req.params.id;
	User.findOne({_id: poll_id}, function(error, user){
		if (error) {
			return next(error);
		} else {
			return res.render('vote', {
				poll_id: poll_id,
				index: index,
				twitter: user.polls[index].twitter,
				poll_q: user.polls[index].poll_q,
				poll_a: user.polls[index].poll_a //array
			});						
		}
	})
});

router.all('/api', authorize);

/* GET polls API */
router.get('/api/polls', function(req, res, next) {
	User.aggregate([
	    { 
			$project: { _id: 0, polls: 1 } 
		}
	], function(err, data) {
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
	User.findOneAndUpdate(
		{_id: user_id},
		{$push: {"polls": poll}},
		{safe: true, upsert: true, new: true},
		function(error, data){
			//console.log(data)
			res.send(data);
		}
	);
});

/* GET single poll API */ //for edits in admin mode
router.get('/api/polls/:id/:index', function(req, res, next){
	var user_id = req.session.userId;
	var index = req.params.index;
	var poll_id = req.params.id;
	//User.findOne({'polls[index]._id': req.params.id}, function(error, poll){
	User.findOne({_id: user_id}, function(error, user){
		if (error) {
			return next(error);
		} else {
			return res.render('edit', {
				poll_id: user_id,
				index: index,
				poll_q: user.polls[index].poll_q,
				poll_a: user.polls[index].poll_a //array
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
	answers = JSON.parse(JSON.stringify(answers))
	var data = {
		poll_q: poll_q,
		poll_a: answers
	}
	//data = JSON.parse(JSON.stringify(data))
	var queryObj = {'_id': req.params.id, 'polls.index': index};
	
	var set_pollq = {$set: {}};
	set_pollq.$set['polls.$.poll_q'] = JSON.parse(JSON.stringify(poll_q));
	var set_polla = {$set: {}};
	set_polla.$set['polls.$.poll_a'] = answers;
	User.findOneAndUpdate(
		queryObj,
		set_pollq,
		//{safe: true, upsert: false},
		function(error){
			if (error) {
				return next(error);
			}
			User.findOneAndUpdate(
				queryObj,
				set_polla,
				//{safe: true, upsert: false},
				function(error){
					if (error) {
						return next(error);
					}
					return res.redirect('/');
				}
			);
		}
	);
	
						
	
});


/* DELETE poll API */
router.delete('/api/polls/:id/:index', function(req, res, next) {
	var user_id = req.session.userId;
	var poll_id = req.params.id;
	var index = req.params.index;
	if (!req.params.id) {
		return next(new Error('No poll ID.'));
	}
	User.findOneAndUpdate(
		{_id: user_id},
		{$pull: {"polls": { index: index }}},
		function(err){
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
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
	User.findOne({_id: user_id}, function(error, usr){
		if (error) {
			return next(error);
		} else {
			return res.render('create', {
				greet: usr.user,
				result: 'Hello'+usr.user+'! Create your poll',
				polls: usr.polls
			});						
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
	var url = req.protocol + '://'+ req.get('host') + '/polls/'+ user_id + '/' + index + '';
	var twitter = 'http://twitter.com/share?text=An%20Awesome%20Poll&url='+url;
	
	var data = {
		poll_id: user_id,
		poll_q: poll_q,
		poll_a: answers,
		index: index,
		twitter: twitter
	}
	User.findOneAndUpdate(
		{_id: user_id},
		{$push: {"polls": data}},
		{safe: true, upsert: true, new: true},
		function(error, user){
			if (error) {
				return next(error);
			}
			//console.log(user.poll_a)
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
	User.findOne({_id: req.body.poll_id, 'polls.index': index}, function(err, data){
		if (err) {
			return next(err); 
		} else {
			//data = data[0]
			var vals = [];
			var names = [];
			
			var answers = data.polls[index].poll_a;
			for (var i = 0; i < answers.length; i++) {
				vals.push(answers[i].value);
				names.push(answers[i].name);
			}
			var ans_ind = names.indexOf(req.body.checked);
			var checked_val = vals[ans_ind];
			checked_val++;
			var newAnswers = [];
			for (i = 0; i < answers.length; i++) {
				if (i === ans_ind) {
					newAnswers.push({name: names[i], value: checked_val})
				} else {
					newAnswers.push({name: names[i], value: vals[i]})
				}
			}
			//console.log(newAnswers)
			newAnswers = JSON.parse(JSON.stringify(newAnswers))

			var queryObj = {'_id': req.body.poll_id, 'polls.index': index};
			var set = {$set: {}};
			set.$set['polls.$.poll_a'] = newAnswers;
			var push = {$push: {}};
			push.$push['polls.$.voters'] = JSON.parse(JSON.stringify({voter_id: user_ip}));

			var options = { 
				//'overwrite': true, 
				//'new': true, 
				//'safe': true, 
				//'upsert': false, 
				//'multi': false 
				}
			
			User.findOneAndUpdate(
				queryObj, 
				set, 
				options,
				function(error){
					if(error) {
						//console.log('error!')
					}
					User.findOneAndUpdate(
						queryObj,
						push,
						function(er) {
							if (er) {
								//console.log('er!')
							}
							return res.redirect('/');
						}
					)
					
			});
		}
	});
});

/* GET admin page */
router.get('/admin', authorize, function(req, res, next) {
	User.findOne({_id: req.session.userId}, function(err, user) {
	  	//console.log(JSON.stringify(user));
		if (err) {
			return next(err);
		} else {
			return res.render('admin', {
				polls: user.polls
			});
		}
	});
});

module.exports = router;