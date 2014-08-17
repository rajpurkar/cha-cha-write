var fs = require('fs');

function convertLocationToPeople(filename, callback){
	fs.readFile(filename, function(err, data){
		var filt = String(data).split('\n');
		var dict = {}
		var header = filt[0].split('\t');
		for(var i = 1; i < filt.length; i++){
			var row = (filt[i]).split('\t');
			if(!(row[0] in dict)){
				dict[row[0]] = [];
			}
			var a = {}
			a.person = row[1];
			for(var j= 2; j < header.length; j++){
				a[header[j]] = row[j];
			}
			dict[row[0]].push(a);
		}
		callback(dict);
	});
}

function convertPeopleToActions(filename, callback){
	fs.readFile(filename, function(err, data){
		var filt = String(data).split('\n');
		var dict = {};
		for(var i = 0; i < filt.length; i++){
			var row = (filt[i]).split(new RegExp('\t+'));
			var person = row.splice(0,1);
			if(!(person in dict)){
				dict[person] = [];
			}
			var a = {verb:row[0].split(' ')[0], noun:"", adj:"", freq:row[2]};
			var object = row[1].split(' ');
			if(object[1] === "adj"){
				a.adj = object[0];
			}else{
				a.noun = object[0];
			}
			dict[person].push(a);
		}
	callback(dict);
	});
}

function convertLocationToObjects(filename, callback){
	fs.readFile(filename, function(err, data){
		var filt = String(data).split('\n');
		var dict = {}
		var header = filt[0].split('\t');
		for(var i = 1; i < filt.length; i++){
			var row = (filt[i]).split('\t');
			if(!(row[0] in dict)){
				dict[row[0]] = [];
			}
			var a = {}
			a.object = row[1];
			for(var j= 2; j < header.length; j++){
				a[header[j]] = row[j];
			}
			dict[row[0]].push(a);
		}
		callback(dict);
	});
}


/*
convertLocationToPeople("loc-ppl.tsv", function(data){
	fs.writeFileSync("loc-ppl.json", JSON.stringify(data));
});
*/
/*
convertPeopleToActions("reverb-clone6.tsv", function(data){
	fs.writeFileSync("ppl-act.json", JSON.stringify(data));
});
*/
/*
convertLocationToObjects("objects_at_locations.txt", function(data){
	fs.writeFileSync("loc-obj.json", JSON.stringify(data));
});
*/