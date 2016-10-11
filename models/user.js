var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

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
	},
	polls: [
		{
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
				reqired: true,
				trim: true
			}	
			
		}
	],
	votes: [
		{
			poll_id: {
				type: String
			},
			ans_a: {
				type: Boolean
			},
			ans_b: {
				type: Boolean
			}
		}
	]
}, { collection: 'fcc_voters_local' });
// authenticate input against database documents
UserSchema.statics.authenticate = function(user, pass, callback) {
	User.findOne({ user: user })
    	.exec(function (error, user) {
      		if (error) {
          		return callback(error);
        	} else if ( !user ) {
          		var err = new Error('User not found.');
          		err.status = 401;
          		return callback(err);
        	}
        	bcrypt.compare(pass, user.pass , function(error, result) {
          		if (result === true) {
            		return callback(null, user);
          		} else {
            		return callback();
          		}
        	})
     });
}
// hash password before saving to database
UserSchema.pre('save', function(next) {
	var user = this;
	bcrypt.hash(user.pass, 10, function(err, hash) {
		if (err) {
			return next(err);
		}
		user.pass = hash;
    	next();
  	})
});
var User = mongoose.model('User', UserSchema);

module.exports = User;