var express = require("express");
var path = require("path");
var dotenv = require('dotenv');
var bodyParser = require("body-parser");
//var mongodb = require("mongodb");
var mongoose = require("mongoose");
var session = require('express-session');
//var mongo = require('./mongo_client.js');
var MongoStore = require('connect-mongo')(session);
var User = require('./models/user');
var D3Node = require('d3-node');
//var d3 = require('d3');
var d3 = D3Node.d3;
//d3.select(d3n.document.body).append('span');
//const svg2png = require('svg2png');
/*const styles = {'.bar {
  fill: steelblue;
}

.bar:hover {
  fill: tomato;
}

.title {
  font: bold 14px "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.axis {
  font: 10px sans-serif;
}

.axis path,
.axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}

.x.axis path {
  display: none;
}
'};*/
const markup = '<div id="chart"></div>'
var options = {selector:'#chart', container:markup};
var d3n = new D3Node(options);
//d3n.html();
var svg = d3n.createSVG().append('g')
 
//d3.select(document.body).append('svg');

var pug = require('pug');

var app = express();
dotenv.load();

mongoose.connect(process.env.DEVDB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// use sessions for tracking logins
app.use(session({
  secret: 'treehouse loves you',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// make user ID available in templates
//var user_id;
app.use(function (req, res, next) {
  	res.locals.currentUser = req.session.userId;
	var user_id = res.locals.currentUser;
	if (!user_id) {
		return res.redirect('/login');
	} else {
		User.findOne({_id: user_id}, function(error, data){
			//var xAxis = Object.keys(data.votes[0]); //string .. better way needed for index
			//var dataObj = [];
			//for (var i in data) {
			//	dataObj.push({})
			//}
			if (error) {
				return next(error);
			} else {
				var yKeys = Object.values(data.votes[0]); //number
				var yMax = Math.max(yKeys);
				var yA = Object.values(data.votes[0].ans_a);
				var yB = Object.values(data.votes[0].ans_b);
				var yDomain = [yA, yB];
				var question = data.polls[0].poll_q;
				var answerA = data.polls[0].ans_a; //string
				var answerB = data.polls[0].ans_b; //string
				var xDomain = [answerA, answerB];
				var user_id = req.session.userId;
				var margin = {top: 80, right: 180, bottom: 80, left: 180},
				    width = 400 - margin.left - margin.right,
				    height = 300 - margin.top - margin.bottom;

				var x = d3.scale.ordinal()
				    .rangeRoundBands([0, width], .1, .3);

				var y = d3.scale.linear()
				    .range([height, 0]);

				var xAxis = d3.svg.axis()
				    .scale(x)
				    .orient("bottom");

				var yAxis = d3.svg.axis()
				    .scale(y)
				    .orient("left")
				    .ticks(8, "%");

				var svg = d3n.createSVG()
					  .attr("width", width + margin.left + margin.right)
					  .attr("height", height + margin.top + margin.bottom)
					  .append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				/*var xAxis = d3.ordinal.scale()
					.range([margin.left, width-margin.right])
					.domain([answerA, answerB]);*/


				x.domain(xDomain.map(function(d){
					return d;
				}));
				y.domain([0, yMax]);

			  	svg.append("text")
			      .attr("class", "title")
			      .attr("x", xDomain)
			      .attr("y", -26)
			      .text(question);

			  	svg.append("g")
			      .attr("class", "x axis")
			      .attr("transform", "translate(0," + height + ")")
			      .call(xAxis)
			    .selectAll(".tick text")
			      .call(wrap, x.rangeBand());

			  	svg.append("g")
			      .attr("class", "y axis")
			      .call(yAxis);

			  	svg.selectAll(".bar")
			      .data(data)
			    .enter().append("rect")
			      .attr("class", "bar")
			      .attr("x", xDomain )
			      .attr("width", x.rangeBand())
			      .attr("y", yDomain)
			      .attr("height", function(d) { return height - y(d.value); });
				/*
				const fs = require('fs');
				const svg2png = require('svg2png');

				module.exports = function (outputName, d3n) {

				  fs.writeFile('examples/dist/'+outputName+'.html', d3n.html(), function () {
				    console.log('>> Done. Open "examples/dist/'+outputName+'.html" in a web browser');
				  });

				  var svgBuffer = new Buffer(d3n.svgString(), 'utf-8');
				  svg2png(svgBuffer)
				    .then(buffer => fs.writeFile('examples/dist/'+outputName+'.png', buffer))
				    .catch(e => console.error('ERR:', e))
				    .then(err => console.log('>> Exported: "examples/dist/'+outputName+'.png"'));
				};

						  	return res.render('create', {
								title: 'FCC Voting App',
								greet: usr.user,
								result: 'Hello'+usr.user+'! Create your poll'
							});						
				*/
			}
		})
		
	}
  	next();
});

app.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(urlencodedParser);


app.use(express.static(__dirname + '/public'));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//routes
var index = require('./index');
app.use('/', index);

//app.get(function(req, res, next){
//	var user_id = req.session.userId;
//console.log(user_id)
//if (user_id) {
	
//}
//})

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
