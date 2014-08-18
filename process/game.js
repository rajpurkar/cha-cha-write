var locppl = require('../files/loc-ppl.json');
var pplact = require('../files/ppl-act-filt.json');
var locobj = require('../files/loc-obj.json');

exports.getPersons = function(env){
	return locppl[env];
}

exports.getObjects = function(env){
	return locobj[env];
}

exports.getActions = function(person){
	return pplact[person];
}