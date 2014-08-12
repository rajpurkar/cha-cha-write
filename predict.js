var _ = require('underscore');
var graph = require('./files/graph.json');

function getRel(word, type){
	var key = word + " " + type;
	if(key in graph){
		return graph[key];
	} else return null;
}

exports.getRel = getRel;
