var express = require('express');
var path = require('path');
var _ = require('underscore');
var routes = require('./routes')
var dotenv = require('dotenv');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var mongodb = require("mongodb");
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session); //let connect-mongo access session
var User = require('./models/user');
var app = express();
var index = require('./routes/index');
dotenv.load();

var uri = process.env.MONGODB_URI;//process.env.DEVDB || ;

mongoose.connect(uri,{auth:{authdb:"heroku_t452bq5j"}});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));



//app.set('trust proxy', true);


//app.use(cookieParser());
// use sessions for tracking logins
/*app.use(session({
	secret: 'fccftw',
	resave: true,
	saveUninitialized: false,
	store: new MongoStore({
		mongooseConnection: db
	})
}));
*/
var sess = {
  	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: false,
	cookie: {},
	store: new MongoStore({
		mongooseConnection: db
	})
  
}

if (app.get('env') === 'production') {
	app.set('trust proxy', 1) // trust first proxy
	sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))

// make user ID available in templates
app.use(function (req, res, next) {
  	res.locals.currentUser = req.session.userId;
	next();
});

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.locals.appTitle = "FCC Voting app";


app.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(urlencodedParser);

//routes
app.use('/', index);

/*app.all('*', function(req, res) {
	res.send(404);
})*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('File Not Found');
	err.status = 404;
	next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

var server = app.listen(process.env.PORT || 8080, function(){
	var port = server.address().port;
	console.log('App now running on port', port);
});

var shutdown = function() {
	server.close();
}