var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
var http = require('http');
var request = require('request');
var async = require('async');
var _ = require('underscore');
var fs = require('fs');
// view engine setup
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

app.get('/test', function (req, res){
    res.send('[{"o2": "_", "v2": "drive", "v1": "start", "count": 86, "o1": "car"}, {"o2": "_", "v2": "pull", "v1": "start", "count": 53, "o1": "car"}, {"o2": "car", "v2": "_", "v1": "start", "count": 53, "o1": "car"}]');
});

app.get('/path/:v1/:o1/:v2/:o2', function(req, res){
    var obj = {}
    request('http://localhost:5000/find_paths/' + req.params.v1 + '/' + req.params.o1 + '/' + req.params.v2 + '/'  + req.params.o2 + '/10' , function (error, response, body) {
       body = JSON.parse(body);
        for(var i = 0; i < body.length; i++){
            var path = body[i];
            for (var j =0 ; j < path.length; j++){
                var item = path[j];
                item = item.verb + " " + item.object;
                if(!(item in obj))
                    obj[item] = 0;
                obj[item] += 1;
            }
        }
        sorted_obj = _.sortBy(_.filter(_.map(obj, function(v,k){return [v,k] }), function(x){ return x[0] > 1 }), function(x) { return -1 * x[0] })
        res.send(sorted_obj);
        //res.render('path', {paths: JSON.parse(body)});
    });
});

var objects = null;

function getObjects(objects, callback){
    if(objects == null){
        fs.readFile('/objects-unnormalized.json', 'utf8', function (err, data) {
            if (err) {
                console.log('Error: ' + err);
                return;
            }
            alreadyRead = true;
            objects = JSON.parse(data);
            callback(objects);
        });
    }else{
        callback(objects);
    }
}

function getCount(item, callback){
    request('http://localhost:5000/gram/' + item.v2 + '/' + item.o2, function(error, response,body){
        if(error){ callback(err, null); }
        body = JSON.parse(body);
        callback(null, body)
    });
}


function downloadEdge(item, callback){
    var item = String(item).split(',');
    request('http://localhost:5000/edges/' + item[0] + '/' + item[1] + '/5/no_blank', function(error, response, body){
        if(error){ callback(err, null); }
        //callback(null, body);
        var predictions = {}
        body = JSON.parse(body);
        async.map(body, getCount, function(err, results){
            if(err) {callback(err, null);}
            for(var k = 0; k < results.length; k++){
                var kth = results[k];
                predictions[kth.verb + " "  + kth["object"]] = body[k].count / ((1.0)*kth.count);
            }
            callback(null, predictions);
        });
    });

}

function sortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'action': prop,
                'freq': obj[prop]
            });
        }
    }
    arr.sort(function(a, b) { return b.freq - a.freq; });
    //arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
    return arr; // returns array
}

app.get('/relevant', function(req, res){
    
}

app.get('/predict/:text', function(req, res){
    request("http://localhost:5000/convert/" + req.params.text, function(error, response, body){
        body = JSON.parse(body);
        if(body.length > 0){
            async.map(body, downloadEdge, function(err, results){
                total = {}
                for(var i = 0; i < results.length; i++){
                    var d = results[i];
                    for(var item in d){
                        if(!(item in total)){
                            total[item] = 0;
                        }
                        total[item] += d[item]*(i+1)*0.1;
                    }
                }
                toIgnore = {}
                for(var i = 0; i < body.length; i++){
                    toIgnore[body[i][0] + " " + body[i][1]] = "yes";
                }
                sortedTotal = sortObject(total)
                sortedTotal = sortedTotal.filter(function(element){
                    return !(element.action in toIgnore);
                });
                res.send({soFar: body, predictions:sortedTotal});
            });
        } else { res.send(null);}
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
