var pos = require('pos');
var natural = require('natural');
var Lemmer = require('../extras/node-lemmer').Lemmer;
var lemmerEng = new Lemmer('english');

function lemmatize(word){
	return lemmerEng.lemmatize(word);
}
 exports.lemmatize = lemmatize;

function isVerb(tagged){
	return (tagged[1][0]=== "V");
}

function isNoun(tagged){
	return ((tagged[1][0]=== "N") && (tagged[1] !== "NNP"));
}

function isAdj(tagged){
	return (tagged[1][0]=== "J");
}

function extractRelevant(posTagged){
	return(posTagged.filter(function(tagged){
		if(isNoun(tagged) || isVerb(tagged) || isAdj(tagged)){return true};
		return false;
	}));
}

function lemmatizeWords(posTagged){
	all = [];
	posTagged.forEach(function(tagged){
		var possible =  lemmatize(tagged[0]);
		var options = possible.filter(function(option){
			if((isVerb(tagged) && option['partOfSpeech'] === "VERB")
			   || (isNoun(tagged) && option['partOfSpeech'] === "NOUN")
			   || (isAdj(tagged) && option['partOfSpeech'] === "ADJ_FULL")){
				return true;
			}
			return false;
		});
		if(options.length > 0){
			all.push({'input': options[0]['text'].toLowerCase(), 'tag': options[0]['partOfSpeech']});
		}
	});
	return all;
}

exports.lemmatizeWords = lemmatizeWords;

function posTag(sentence){
	var words = new pos.Lexer().lex(sentence);
	var taggedWords = new pos.Tagger().tag(words);
	return taggedWords
}

exports.posTag = posTag;

function extractLemmatized(sentence){
	var taggedWords = posTag(sentence);
	var relevantTagged = extractRelevant(taggedWords);
	var lemmatizedTagged = lemmatizeWords(relevantTagged);
	return lemmatizedTagged;
}

exports.extractLemmatized = extractLemmatized;