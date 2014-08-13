var _ = require('underscore');
var graph = require('./files/graph.json');

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