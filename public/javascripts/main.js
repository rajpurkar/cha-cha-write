(function($){
	//localstorage functions

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

	//processes the current state of the doc
	function processInput(){
		var presentText = $("#doc").text().replace(",", ".").split('.').splice(-5); //use the last 5 'phrases'
		
		$.get( "/predict/" + presentText, function(data){
			var graph = new Graph(data);
			graph.convertGraph();
			graph.draw();
			//$('#sidebar-text').text(JSON.stringify(data).splice(10));
		});
	}

	$("#doc").keypress(function(e) {
		console.log(e.keyCode);
		saveState();
		if(e.keyCode === 46 || e.keyCode === 44){
			//processInput();
		}
	});

	if(resumeState()){
		//getRandom();
		//window.setInterval(getRandom, 15000);
		//draw();
		processInput();
    }
})($);

