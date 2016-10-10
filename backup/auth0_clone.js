function login(email, password, callback) {
  mongo('mongodb://tbushman:wtfOMG520@ds053126.mlab.com:53126/heroku_t452bq5j', function (db) {
    var users = db.collection('fcc_voters');
    users.findOne({ email: email }, function (err, user) {

      if (err) return callback(err);

      if (!user) return callback(new WrongUsernameOrPasswordError(email));

      bcrypt.compare(password, user.password, function (err, isValid) {
        if (err) {
          callback(err);
        } else if (!isValid) {
          callback(new WrongUsernameOrPasswordError(email));
        } else {
          callback(null, {
            user_id: user._id.toString(),
            nickname: user.nickname,
            email: user.email
          });
        }
      });
    });
  });
}

function create (user, callback) {
  mongo('mongodb://tbushman:wtfOMG520@ds053126.mlab.com:53126/heroku_t452bq5j', function (db) {
    var users = db.collection('fcc_voters');

    users.findOne({ email: user.email }, function (err, withSameMail) {

      if (err) return callback(err);
      if (withSameMail) return callback(new Error('the user already exists'));

      bcrypt.hashSync(user.password, 10, function (err, hash) {
        if (err) { return callback(err); }
        user.password = hash;
        users.insert(user, function (err, inserted) {
          if (err) return callback(err);
          callback(null);
        });
      });
    });
  });
}

function verify (email, callback) {
  mongo('mongodb://tbushman:wtfOMG520@ds053126.mlab.com:53126/heroku_t452bq5j', function (db) {
    var users = db.collection('fcc_voters');
    var query = { email: email, email_verified: false };

    users.update(query, { $set: { email_verified: true } }, function (err, count) {
      if (err) return callback(err);
      callback(null, count > 0);
    });
  });
}

function changePassword(email, newPassword, callback) {
  mongo('mongodb://tbushman:wtfOMG520@ds053126.mlab.com:53126/heroku_t452bq5j', function (db) {
    var users = db.collection('fcc_voters');

    bcrypt.hash(newPassword, 10, function (err, hash) {
      if (err) {
        callback(err);
      } else {
        users.update({ email: email }, { $set: { password: hash } }, function (err, count) {
          if (err) return callback(err);
          callback(null, count > 0);
        });
      }
    });
  });
}

function remove (id, callback) {

  mongo('mongodb://tbushman:wtfOMG520@ds053126.mlab.com:53126/heroku_t452bq5j', function (db) {
    var users = db.collection('fcc_voters');

    users.remove({ _id: id }, function (err) {
      if (err) return callback(err);
      callback(null);
    });
  });

}
