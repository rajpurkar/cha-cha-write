var _ = require('underscore');
var graph = require('../files/graph.json');

exports.getRel = function(word, type){
	var key = word + " " + type;
	if(key in graph){
		return graph[key];
	} else return null;
}

//change postag format
exports.getModType = function(type){
	var modtype = null;
	if(type[0] === "V"){
		modtype = 'v';
	} else if (type[0] === "N"){
		modtype = 'o';
	} else if (type[0] === "A"){
		modtype = 'adj';
	}
	return modtype;
}

exports.manipulate = function(data){
	var pred = {};
	data.forEach(function(d){
		for(var type in d.output){
			d.output[type].forEach(function(pair, index){
				if(!(pair[0] in pred)){
					pred[pair[0]] = {count: 0, freq: 0};
				}
					pred[pair[0]].count += 1;
					pred[pair[0]].freq += pair[1];
			});
		}
	});
	pred = _.sortBy(_.map(pred, function(k, v){ return [v, k.count, k.freq];}), function(x){ return -(x[1]*10 + x[2])});
	return pred.splice(0,10);
}