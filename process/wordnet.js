var async = require('async');
var WordPOS = require('wordpos');
var wordpos = new WordPOS();
var wn = require('wordnet-magic');
wn.registerDatabase(__base + './files/sqlite-31.db');

exports.getRandom = function(number, callback){
	wordpos.rand({starstWith: '', count: number}, callback);
}

exports.getWords = function(lemmatizedWords, outercallback){
	//lemmatizedWords is of form {"NOUN" : ['dog', 'cat'], "VERB": ['run', 'drive']}

	function wnlookupNoun(word, callback){
		wordpos.lookupNoun(word, function(results){
			callback(null, results);
		});
	}

	function wnlookupVerb(word, callback){
		wordpos.lookupVerb(word, function(results){
			callback(null, results);
		});
	}

	async.parallel({
		verb: function(callback){
			async.map(lemmatizedWords["VERB"], wnlookupVerb, function(err, results){
				callback(null, results);
			});
		},
		noun: function(callback){
			async.map(lemmatizedWords["NOUN"], wnlookupNoun, function(err, results){
				callback(null, results);
			});
		},
	}, function (err, results){
		outercallback(results);
	});
}

function getBaseForm(word, type, callback){
	//type is "n" or "v" or "a"
	wn.morphy(word, type, function(err, data){
		callback(data);
	});
}

exports.getBaseForm = getBaseForm;

exports.getHypernyms = function(word, type, callback){
	//type is "n" or "v" or "a"
	getBaseForm(word, type, function(data){
		wn.fetchSynset(data[0]['lemma'] + "." + type + "." + "1", function(err, synset){
			synset.getHypernymTree(function(err, data){
			callback(data);
			});
		});
	});
}