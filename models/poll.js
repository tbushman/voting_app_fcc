var mongoose = require('mongoose');

var PollSchema = new mongoose.Schema({
	_id: {
		type: String
	},
	user_id: {
		type: String
	},
	index: {
		type: Number
	},	
	poll_q: {
		type: String,
		required: true,
		trim: true
	},
	poll_a: [
		{
			name: String,
			value: Number
		}
	],
	voters: [
		{
			voter_id: String
		}
	]
	
}/*, { collection: 'fcc_voters_local' }*/);

var Poll = mongoose.model('Poll', PollSchema, 'fcc_voters_local');

module.exports = Poll;