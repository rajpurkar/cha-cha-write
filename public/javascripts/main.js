(function($){
	function updateSoFar(data){
		$("#soFar-text").empty();
		for(var i = 0; i < data.length; i++){
			$("#soFar-text").append("<h3 class='soFar'>" + String(data[i]).split(",").join(" ") + "</h3>");
		};
	}
	function processInput(){
		var presentText = $("#doc").text();
		$.get( "http://localhost:5000/convert/" + presentText, function(data){
			data = JSON.parse(data);
			updateSoFar(data);
			if(data.length > 0){
				var toSearchForPredict = String(data[data.length-1]).split(',');
				getPredictions('http://localhost:5000/edges/' + toSearchForPredict[0] + '/' + toSearchForPredict[1] + '/5/no_blank')
			}
		});
	}
	$("#doc").keypress(function(e) {
		console.log(e.keyCode);
		if(e.keyCode === 46){
			processInput();
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
})($);