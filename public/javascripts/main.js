(function($, d3, window, localStorage){

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
			var i = 0;
			var n = findNode(id);
			while (i < links.length) {
				if ((links[i]['source'] == n))
				{
					links.splice(i,1);
					var candidate = links[i]['target'];
					if(candidate.id.split(' ')[1] !== "i"){
						nodes.splice(candidate.index, 1);
					}
				}
				else i++;
			}
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
			nodes.splice(0,links.length);
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
				if (nodes[i]["id"] === id) return nodes[i];};
		};

		var findNodeIndex = function(id) {
			for (var i=0;i<nodes.length;i++) {
				if (nodes[i].id==id){
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
		.attr("transform", "translate(" + 200 + "," + -50 + ")")
		.call(zoom);

		var rect = svg.append("rect")
		.attr("width", width)
		.attr("height", height)
		.style("fill", "none")
		.style("pointer-events", "all");

		var container = svg.append("g");

		var force = d3.layout.force()
		.gravity(0.3)
		.distance(60)
		.charge(-2000)
		.chargeDistance(300)
		.friction(0.4)	
		.theta(0.7)
		.size([width, height])


		var nodes = force.nodes(),
			links = force.links();

		this.nodes = nodes;

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
			.call(force.drag);

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

				node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y         + ")"; });

				link.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });
			});

			// Restart the force layout.
			force.start();
		};

		this.update = update;


		// Make it all go
		update();
	}

	var graph = new myGraph();

	function processInput(){
		var presentText = $("#doc").text().replace(",", ".").split('.');
		if($("#doc").text().length <= 1){
			console.log(graph);
			graph.removeAllNodes();
			graph.removeAllLinks();
		}
		presentText = presentText.splice(-3);
		
		$.get( "/predict/" + presentText, function(data){
			graph.nodes.forEach(function(node){
				var spl = node.id.split(' ');
				if(spl[1] === "i"){
					var toRemove = true;
					data.forEach(function(extraction){
						if(extraction.input === spl[0]){
							toRemove = false;
							return;
						}
					});
					if(toRemove){
						graph.removePathNode(node.id);
					}
				}
			});

			for(var j =0 ; j<data.length; j++){
				var extraction = data[j];
				var input = extraction.input;
				if(graph.findNodeIndex(input + " " + "i") !== -1) continue;
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

	$("#doc").keypress(function(e) {
		saveState();
		if(e.keyCode === 46 || e.keyCode === 44 || e.keyCode ==32){
			processInput();	
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
	}

})($, d3, window, localStorage);
