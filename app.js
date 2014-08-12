//app-independent dependencies
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var prettyjson = require('prettyjson');
var async = require('async');

//app-dependant local dependencies
var py = require('./pyServBridge.js');
var wn = require('./wordnet.js');
var nlp = require('./nlp.js');

//json file
var graph = require("./relations.json");

//app setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors());
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
	res.render('main');
});


//py specific routes
app.get('/py/path/:v1/:o1/:v2/:o2', function(req, res){
	py.getPath(req.params.v1, req.params.o1, req.params.v2, req.params.o2, function(obj){
		res.send(obj);
	});
});

app.get('/py/relevant/:list', function(req, res){
	var list = req.params.list.split(',');
	py.getObjects(list, function(objects){
		res.json(objects);
	});
});

app.get('/py/predict/:text', function(req, res){
	py.predict(req.params.text, function(data){
		res.json(data);
	});
});

app.get('/nlp/lemmatize/:word', function(req,res){
	res.json(nlp.lemmatize(req.params.word));
});

app.get('/nlp/postag/:text', function(req, res){
	res.json(nlp.posTag(req.params.text));
});

app.get('/nlp/extractvn/:text', function(req, res){
	res.json(nlp.extractLemmatized(req.params.text));
});

app.get('/wn/random/:count', function(req, res){
	wn.getRandom(req.params.count, function(data){
		res.json(data)
	});
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
