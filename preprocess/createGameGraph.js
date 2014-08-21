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
			var a = {verb:row[0].split(' ')[0], object:row[1].split(' ')[0], freq:row[2]};
			/*
			var object = row[1].split(' ');
			if(object[1] === "adj"){
				a.adj = object[0];
			}else{
				a.noun = object[0];
			}
			*/
			dict[person].push(a);
		}
		callback(dict);
	});
}

function convertLocationToObjects(filename, callback){
	fs.readFile(filename, function(err, data){
		var filt = String(data).split('\n');
		var dict = {}
		var header = filt[0].split(new RegExp('\t+'));
		for(var i = 1; i < filt.length; i++){
			var row = (filt[i]).split(new RegExp('\t+'));
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

function convertPersonToVerb(filename, callback){
		fs.readFile(filename, function(err, data){
		var filt = String(data).split('\n');
		var dict = {}
		var header = filt[0].split(new RegExp('\t+'));
		for(var i = 1; i < filt.length; i++){
			var row = (filt[i]).split(new RegExp('\t+'));
			var a = {}
			a.verb = row[1];
			for(var j= 2; j < header.length; j++){
				a[header[j]] = row[j];
			}
			if(!(String(row[0]) in dict)){
				dict[String(row[0])] = [];
			}
			dict[String(row[0])].push(a);
		}
		callback(dict);
	});
}

function filterPeopleToActions(filename1, filename2, callback){
	var p2a = JSON.parse(fs.readFileSync(filename1));
	var l2p = JSON.parse(fs.readFileSync(filename2));
	var validPersons = {};
	for(var location in l2p){
		(l2p[location]).forEach(function(obj){
			validPersons[obj.person] = true;
		});
	}
	var filtp2a = {}
	for(var person in p2a){
		var personMod = person.split(' ')[0];
		if(personMod in validPersons){
			filtp2a[personMod] = p2a[person];
		}
	}
	callback(filtp2a);
}


/*
convertLocationToPeople("../files/loc-ppl.tsv", function(data){
	fs.writeFileSync("../files/loc-ppl.json", JSON.stringify(data));
});
*/
/*
convertPeopleToActions("../files/reverb-clone6.tsv", function(data){
	fs.writeFileSync("../files/ppl-act.json", JSON.stringify(data));
});
*/

/*
convertLocationToObjects("../files/all_data/location-object.tsv", function(data){
	//console.log(data);
	fs.writeFileSync("../files/loc-obj.json", JSON.stringify(data));
});
*/

/*
filterPeopleToActions("../files/ppl-act.json", "../files/loc-ppl.json", function(data){
	fs.writeFileSync("../files/ppl-act-filt.json", JSON.stringify(data));
});
*/

convertPersonToVerb("../files/all_data/person-verb.tsv", function(data){
	//console.log(data);
	fs.writeFileSync("../files/per-verb.json", JSON.stringify(data));
});