(function($, d3, window, localStorage){
	var nodes;
	function myGraph() {

		// Add and remove elements on the graph object
		this.addNode = function (id) {
			nodes.push({"id":id});
		};

		this.removeNode = function (id) {
			var i = 0;
			var n = findNode(id);
			while (i < links.length) {
				if ((links[i]['source'] == n)||(links[i]['target'] == n))
				{
					links.splice(i,1);
				}
				else i++;
			}
			nodes.splice(findNodeIndex(id),1);
			update();
		};

		this.removePathNode = function (id) {
			var n = findNode(id);
			links.forEach(function(link, index){
				if (links[index].source == n){
					links.splice(index,1);
					var candidate = links[index].target;
					if(candidate.id.split(' ')[1] !== "i"){
						nodes.splice(candidate.index, 1);
					}
				}else if(links[index].target == n){
					links.splice(index,1);
					var candidate = links[index].source;
					if(candidate.id.split(' ')[1] !== "i"){
						nodes.splice(candidate.index, 1);
					}
				}
			});
			nodes.splice(findNodeIndex(id),1);
			update();
		};

		this.removeLink = function (source,target){
			for(var i=0;i<links.length;i++)
			{
				if(links[i].source.id == source && links[i].target.id == target)
				{
					links.splice(i,1);
					break;
				}
			}
			update();
		};

		this.removeAllLinks = function(){
			links.splice(0,links.length);
			update();
		};

		this.removeAllNodes = function(){
			nodes.splice(0,nodes.length);
			update();
		};

		this.addLink = function (source, target, value) {
			for(var i=0;i<links.length;i++)
			{
				if(links[i].source.id == source && links[i].target.id == target)
				{
					return null;
				}
			}
			links.push({"source":findNode(source),"target":findNode(target),"value":value});
		};

		var findNode = function(id) {
			for (var i in nodes) {
				if (nodes[i].id === id) return nodes[i];};
		};

		var findNodeIndex = function(id) {
			for (var i=0;i<nodes.length;i++) {
				if (nodes[i].id==id){
					return i;
				}
			};
			return -1;
		};

		this.findNodeIndexSoft = function(id) {
			for (var i=0;i<nodes.length;i++) {
				if (nodes[i].id.split(' ')[0]==id.split(' ')[0]){
					return i;
				}
			};
			return -1;
		};

		this.findNodeIndex = findNodeIndex;

		var width = parseInt(d3.select('#d3div').style('width'), 10);
		var height = parseInt(d3.select('#d3div').style('height'), 10);

		var zoom = d3.behavior.zoom()
		.scaleExtent([0.5, 5])
		.on("zoom", zoomed);

		var drag = d3.behavior.drag()
		.origin(function(d) {
			return d;
		})
		.on("dragstart", dragstarted)
		.on("drag", dragged)
		.on("dragend", dragended);

		function zoomed() {
			container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		}

		function dragstarted(d) {
			d3.event.sourceEvent.stopPropagation();
			d3.select(this).classed("dragging", true);
		}

		function dragged(d) {
			d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
		}

		function dragended(d) {
			d3.select(this).classed("dragging", false);
		}

		var svg = d3.select("#d3div").append("svg")
		.append("g")
		.attr("width", width)
		.attr("height", height)
		.attr("transform", "translate(" + 250 + "," + -50 + ")")
		.call(zoom);

		var rect = svg.append("rect")
		.attr("width", width)
		.attr("height", height)
		.style("fill", "none")
		.style("pointer-events", "all");

		var container = svg.append("g");

		var force = d3.layout.force()
		.gravity(0.2)
		.distance(60)
		.charge(-3000)
		//.chargeDistance(400)
		.friction(0.2)
		.size([width, height])


		nodes = force.nodes();
		var links = force.links();

		this.nodes = nodes;
		
		function getLastSource(){
			for(var i = nodes.length-1; i >=0 ; i--){
				if(nodes[i].id.split(' ')[1] === "i"){
					return i;
				}
			}
			return -1;
		};
		var update = function () {
			var link = container.selectAll("line")
			.data(links, function(d) {
				return d.source.id + "-" + d.target.id; 
			});

			link.enter().append("line")
			.attr("id",function(d){return d.source.id + "-" + d.target.id;})
			.attr("class","link")
			.style("stroke-width", function(d) {
				if(d.source.id.split(' ')[1] === "i" && d.target.id.split(' ')[1] === "i"){ return 1;}
				else {return 0;}
			});

			link.exit().remove();

			var node = container.selectAll("g.node")
			.data(nodes, function(d) { 
				return d.id;});

			var nodeEnter = node.enter().append("g")
			.attr("class", "node")

			nodeEnter.append("svg:circle")
			.attr("r", 25)
			.attr("id",function(d) { return d.id;})
			.attr("class","nodeStrokeClass")
			.style("fill", function(d) { 
				var group = d.id.split(' ')[1];
				if(group === 'i'){
					return "#fdd0a2";
				}else{
					return "#ade";
				}
			});
			nodeEnter.append("svg:text")
			.attr("text-anchor", "middle")
			.attr("class","textClass")
			.text( function(d){return d.id.split(' ')[0];}) ;

			node.exit().remove();
			force.on("tick", function() {
				var lastSI = getLastSource();
				//alert(lastSI);
				if(lastSI !== -1){
					nodes[lastSI].x  = width/2;
					nodes[lastSI].y = height/2;
				}
				node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y         + ")"; });

				link.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });
			});

			// Restart the force layout.
			force.start();
			//for (var i = 0; i < 5; ++i){
			//	force.tick();
			//} 
		};

		this.update = update;


		// Make it all go
		update();
	}

	var graph = new myGraph();
	
	function getIdea(){
		$.get( "/suggest/" + $("#doc").text().replace(",", ".").split('.').splice(-3), function(data){
			$('#sidebar-text').empty();
			data.forEach(function(d){
				$('#sidebar-text').append(d[0] + " ");
			});
		});
	}
		

	function processInput(){
		var presentText = $("#doc").text().replace(",", ".").split('.');
		if($("#doc").text().length <= 1){
			graph.removeAllLinks();
			graph.removeAllNodes();
		}
		presentText = presentText.splice(-5);
		
		$.get( "/predict/" + presentText, function(data){
			graph.nodes.forEach(function(node){
				var spl = node.id.split(' ');
				if(spl[1] === "i"){
					var toRemove = true;
					for(var i = 0; i < data.length; i++){
						if(data[i].input === spl[0]){
							toRemove = false;
							break;
						}	
					}
					if(toRemove){
						graph.removePathNode(node.id);
					}
				}
			});

			for(var j =0 ; j<data.length; j++){
				var extraction = data[j];
				var input = extraction.input;
				if(graph.findNodeIndex(input + " " + "i") !== -1) continue;
				var softIndex = graph.findNodeIndexSoft(input + " " + "i");
				if(softIndex !== -1){
					graph.removeNode(nodes[softIndex].id);
				}
				graph.addNode(input + " " + "i");
				if(j >0){
					graph.addLink(data[j-1].input + " " + "i", input + " " + "i", "1");
				}
				if((extraction.output) !== null){
					for(var key in extraction.output){
						var lim = 0;
						for(var i = 0; i < extraction.output[key].length; i++){
							var out = extraction.output[key][i];
							if(lim >= 5){  break;} 
							lim++;
							if(graph.findNodeIndex(out[0]) === -1){
								graph.addNode(out[0] + " " + key);
							}
							graph.addLink(input + " " + "i", out[0] + " " + key, out[1]);
						}
					}
				}
				graph.update();
			};
		});
	}
	var keyCount = 0;
	$("#doc").keypress(function(e) {
		saveState();
		if(e.keyCode === 46 || e.keyCode === 44 || e.keyCode ==32){
			processInput();	
		}
		if(e.keyCode === 46){
			getIdea();
		}
		if(keyCount%50 == 0){
			graph.removeAllLinks();
			graph.removeAllNodes();
			keyCount++;
		}
	});

	//localstorage functions

	function supportsLocalStorage() {
		return ('localStorage' in window) && window.localStorage !== null;
	}

	function saveState(){
		if (!supportsLocalStorage()) { 
			return false; 
		}
		localStorage.text = $("#doc").text();
		return true;
	}

	function resumeState(){
		if (!supportsLocalStorage()) { return false; }
		$("#doc").text(localStorage.text);
		return true;
	}

	if(resumeState()){
		processInput();
		getIdea();
	}

})($, d3, window, localStorage);
