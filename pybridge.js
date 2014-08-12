var request = require('request');
var _ = require('underscore');
var async = require('async');

exports.getPath = function(v1, o1, v2, o2, callback){
	var obj = {};
	request('http://localhost:5000/find_paths/' + v1 + '/' + o1 + '/' + v2 + '/'  +  o2 + '/10' , function (error, response, body) {
		body = JSON.parse(body);
		for(var i = 0; i < body.length; i++){
			var path = body[i];
			for (var j =0 ; j < path.length; j++){
				var item = path[j];
				item = item.verb + " " + item.object;
				if(!(item in obj)) {obj[item] = 0;}
				obj[item] += 1;
			}
		}
		var sorted_obj = _.sortBy(_.filter(_.map(obj, function(v,k){return [v,k] }), function(x){ return x[0] > 1 }), function(x) { return -1 * x[0] })
		callback(sorted_obj);
	});
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

exports.predict =  function(text, callback){

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

	request("http://localhost:5000/convert/" + text, function(error, response, body){
		if(error){ callback(null)}
		//if(body)
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
				callback({soFar: body, predictions:sortedTotal});
			});
		} else { callback(null);}
	});
}