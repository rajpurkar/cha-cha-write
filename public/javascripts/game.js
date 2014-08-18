(function($, d3, window, localStorage){
	var nodes;
	function myGraph() {

		// Add and remove elements on the graph object
		this.addNode = function (id) {
			var ni = {};
			ni.id = id;
			if(id.split(',')[1] === "i"){
			}else{
				var node = findNode(id.split(',').splice(-2).join());
				var theta = Math.random()*2*3.14;
				ni.x = node.x + Math.cos(theta)*100;
				ni.y = node.y + Math.sin(theta)*100;
				node.fixed = true;
			}
			nodes.push(ni);
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

		this.removeNodeLinks = function(source){
			for(var i=0;i<links.length;i++)
			{
				if(links[i].source.id === source)
				{
					var target = links[i].target.id;
					links.splice(i,1);
					nodes.splice(findNodeIndex(target),1);
					return true;
				}
			}
			return false;
		};
		
		this.findLinksWSource = function(source){
			for(var i=0;i<links.length;i++)
			{
				if(links[i].source.id === source)
				{
					return true;
				}
			}
			return false;
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
				if (nodes[i].id === id){ return nodes[i];}
			}
			return null;
		};

		var findNodeIndex = function(id) {
			for (var i=0;i<nodes.length;i++) {
				if (nodes[i].id==id){
					return i;
				}
			}
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
		//.attr("transform", "translate(" + 250 + "," + -50 + ")")
		.call(zoom);

		var rect = svg.append("rect")
		.attr("width", width)
		.attr("height", height)
		.style("fill", "none")
		.style("pointer-events", "all");

		var container = svg.append("g");

		var force = d3.layout.force()
		.gravity(0.1)
		.distance(70)
		.charge(-3000)
		//.chargeDistance(400)
		.friction(0.6)
		.size([width, height])


		nodes = force.nodes();
		var links = force.links();

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
				return 1;
				//if(d.source.id.split(' ')[1] === "i" && d.target.id.split(' ')[1] === "i"){ return 1;}
				//else {return 0;}
			});

			link.exit().remove();

			var node = container.selectAll("g.node")
			.data(nodes, function(d) { 
				return d.id;});

			var nodeEnter = node.enter().append("g")
			.attr("class", "node")

			nodeEnter.append("svg:circle")
			.attr("r", function(d){
				var group = d.id.split(',')[1];
				if(group === 'i'){
					return 50;
				}else{
					return 45;
				}
			})
			.attr("id",function(d) { return d.id;})
			.attr("class","nodeStrokeClass")
			.style("fill", function(d) { 
				var group = d.id.split(',')[1];
				if(group === 'i'){
					return "#fdae6b";
				}else{
					return "#9ecae1";
				}
			});
			nodeEnter.append("svg:text")
			.attr("text-anchor", "middle")
			.attr("class","textClass")
			.text( function(d){ 
				return d.id.split(',')[0];
				/*if(d.id.split(' ')[1] == "i"){
					return d.id.split(' ')[0];
				}else{ 
					return d.id;
				}
				*/
			});

			node.exit().remove();
			force.on("tick", function() {
				node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y         + ")"; });

				link.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });
			});
			
			force.start();
			
			//for(var i = 0; i < 50; i++){
			//	force.tick();
			//}
			
			
		};

		this.update = update;

		// Make it all go
		update();
	}

	var graph = new myGraph();
	var data;
	var count = 0;
	var timer;

	function getRandomAction(actions){
		return actions[Math.round(Math.random()*(actions.length-1))];
	}

	function changeActionWP(person, actions, prob){
		if(actions === undefined){ return;}
		var action = getRandomAction(actions);
		action += "," + person;
		var hasLink = graph.findLinksWSource(person);
		if(hasLink === false || Math.random() < prob){
			graph.removeNodeLinks(person);
			graph.addNode(action);
			graph.addLink(person, action);		
			return true;
		}
		return false;
	}

	function addNodeWP(id, prob){
		if(Math.random() < prob){
			graph.addNode(id);
			return true;
		}
		return false;
	}
	
	function removeActionWP(id, prob){
		if(Math.random() < prob){
			graph.removeNodeLinks(id);
			return true;
		}
		return false;
	}
	
	function removeNodeWP(id, prob){
		if(Math.random() < prob){
			graph.removeNodeLinks(id);
			graph.removeNode(id);
		}
	}

	function playGame(){
		for(var person in data){
			var added = false;
			var changedL = false;
			var removedL = false;
			var removed = false;
			if(graph.findNodeIndex(person + ",i") === -1){
				added = addNodeWP(person + ",i", 0.02);
			} else{
				changedL = changeActionWP(person + ",i", data[person], 0.1);
				if(!changedL){
					removed = removeNodeWP(person+",i", 0.01);
				}
				if(!changedL && !removed){
						removedL = removeActionWP(person+ ",i", 0.01);
				}
			}
			graph.update();
		}
		count++;
		if(count >20){
			clearInterval(timer);
		}
	}
	
	function initGame(){
		var c = 0;
		for(var person in data){
			if(c > 5) break;
			addNodeWP(person + ",i", 1);
			c++;
		}
		graph.update();
	}
	
	function continueGame(){
		timer = setInterval(playGame, 1800);
	}
	
	function generateScene(){
		$.get( "/generateScene/" + window.env, function(d){
			data = d;
			initGame();
			window.setTimeout(continueGame, 2000);
		});
	}

	generateScene();

})($, d3, window, localStorage);
