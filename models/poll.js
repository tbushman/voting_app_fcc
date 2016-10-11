var mongoose = require('mongoose');


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

var Poll = mongoose.model('User', PollSchema);

module.exports = Poll;