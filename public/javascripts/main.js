(function($){
	function supportsLocalStorage() {
    return ('localStorage' in window) && window['localStorage'] !== null;
	}

	function saveState(){
		if (!supportsLocalStorage()) { 
			return false; 
		}
		localStorage["text"] = $("#doc").text();
		return true;
	}

	function resumeState(){
		if (!supportsLocalStorage()) { return false; }
		$("#doc").text(localStorage["text"]);
		return true;
	}

	function updateSoFar(data){
		if(data == undefined){ return; }
		$("#soFar-text").empty();
		var start = data.length - 5;
		if (start < 0){ start = 0; }
		//start = 0
		for(var i = start; i < data.length; i++){
			$("#soFar-text").append("<h3 class='soFar'>" + String(data[i]).split(",").join(" ") + "</h3>");
		};
	}

	function processInput(){
		var presentText = $("#doc").text().replace(",", ".");
		$.get( "/predict/" + presentText, function(data){
			if(data == undefined) return;
			updateSoFar(data.soFar)
			$("#next-text").empty();
			data = data.predictions;
			var max = data.length;
			if(max > 5) { max = 5}
			for(var k = 0; k < max; k++){
				var kth = data[k];
				$("#next-text").append("<h3 class='next'>" + String(kth.action) + "</h3>");
			}
		});
	}


	function getRandom(){
		$.get('/randomv/10', function(data){
			var re = new RegExp(',', 'g');
			data = data.toString().replace(re, ' ');
			console.log(data);
			$("#next-text-new").text(data);
		});
	}

	$("#doc").keypress(function(e) {
		console.log(e.keyCode);
		saveState();
		if(e.keyCode === 46 || e.keyCode === 44){
			getRandom();
		}
	});
	
	function getPredictions(link){
		$.get(link, function(data){
			data = JSON.parse(data);
			$("#next-text").empty();
			for(var k = 0; k < data.length; k++){
				var kth = data[k];
				$("#next-text").append("<h3 class='next'>" + String(kth.v2 + ","  + kth.o2).split(",").join(" ") + "</h3>");
			}	
		});	
	}

	if(resumeState()){
		getRandom();
		//window.setInterval(getRandom, 15000);
		//processInput();
    }
})($);

