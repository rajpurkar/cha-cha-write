(function($){
	var count = 0;
	$( "#doc" ).keypress(function() {
		if(count%10 === 0) {
			$("#sidebar-text").append("Writing random...\n");
		}
		count++;
	});
})($);