var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	user: {
		type: String,
		unique: true,
		required: true,
		trim: true
	},		
	pass: {
		type: String,
		required: true,
	}
});
/*
var PollSchema = new mongooseSchema({
	poll_id: {
		type: String
	},
	poll_q: {
		type: String,
		required: true,
		trim: true
	},
	ans_a: {
		type: String,
		required: true,
		trim: true
	},
	ans_b: {
		type: String,
		reuired: true,
		trim: true
	}	
});

var VotesSchema = new mongooseSchema({
	poll_id: {
		type: String
	},
	ans_a: {
		type: Number
	},
	ans_b: {
		type: Number
	}
});
*/
var User = mongoose.model('User', UserSchema);
//var Poll = mongoose.model('Poll', PollSchema);
//var Vote = mongoose.model('Votes', VotesSchema);

var Schemas = {
	user_schema: User//,
//	poll_schema: Poll,
//	votes_schema: Vote
}

module.exports = Schemas;