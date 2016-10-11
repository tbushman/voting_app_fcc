var mongoose = require('mongoose');

var VotesSchema = new mongooseSchema({
	poll_id: {
		type: String
	},
	ans_a: {
		type: Boolean
	},
	ans_b: {
		type: Boolean
	}
});

var Votes = mongoose.model('User', VotesSchema);

module.exports = Votes;