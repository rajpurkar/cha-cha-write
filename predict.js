var graph = require("./relations.json");

function getRel(word, type){
	var key = word + " " + type;
	if(key in graph){
		return graph[key];
	} else return null;
}

exports.getRel = getRel;

function makeBirectional(){
	for(var key in graph){
		graph[key].forEach(function(value){
			if(!(value in graph)){graph[value] = [];}
			graph[value].push(key);
		});
	}	
}

function convertValToDict(){
	for(var key in graph){
		var values = graph[key];
		var valuesD = {'v': {}, 'adj':{}, "o":{}};
		values.forEach(function(value){
			var parts = value.split(' ');
			if(!(parts[0] in valuesD[parts[1]])){ valuesD[parts[1]][parts[0]] = 0;}
			valuesD[parts[1]][parts[0]] += 1;
		});
		graph[key]= valuesD;
	}	
}

makeBirectional();
convertValToDict();

