var fs = require('fs');
var _ = require('underscore');
var async = require('async');
var assert = require('assert');

function sortGraph(graph){
	for(var key in graph){
		for(var type in graph[key]){
			var obj = graph[key][type];
			graph[key][type] = _.filter(_.sortBy(obj, function(x) { return -1 * x[1] }), function (x) { return  x[1] > 1});
		}
	}
}

async.parallel([function(callback){
	fs.readFile("./files/relations.json", function (err, data) {
		var graph = JSON.parse(data);
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

		function mapFrequencies(){
			for(var key in graph){
				for(var type in graph[key]){
					var arr = [];
					for(var word in graph[key][type]){
						arr.push([word, graph[key][type][word]]);
					}
					graph[key][type] = arr;
				}
			}
		}

		//makeBirectional();
		convertValToDict();
		mapFrequencies();
		callback(null, graph);
	});
}, function(callback){
	fs.readFile('./files/objectrel.tsv', function (err, data) {
		var graph = {};
		if (err) throw err;
		var lines = String(data).split('\n');
		lines.splice(lines.length -1);//remove last line
		lines.forEach(function(line){
			var comps = line.split('\t');
			if(!(comps[0] in graph)){ graph[comps[0]] = []}
			graph[comps[0]].push([comps[1], parseInt(comps[2], 10)]);
		});
		callback(null, graph);
	});
}], function(err, results){
	var voagraph = results[0];
	var oograph = results[1];
	for(key in oograph){
		modkey = key + ' o'
		var valuesD = {'v': [], 'adj':[], "o":[]};
		if(!(modkey in voagraph)){voagraph[modkey] = valuesD;}
		voagraph[modkey]['o'] = oograph[key];
	}
	sortGraph(voagraph);
	fs.writeFile('./files/graph.json', JSON.stringify(voagraph), function (err) {
  		if (err) throw err;
  		console.log('It\'s saved!');
  	});
});