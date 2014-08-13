function convertToD3(g, offset){
	function contains(a, obj) {
		for (var i = 0; i < a.length; i++) {
			if (a[i].name == obj.name && a[i].group == obj.group) {
				return i;
			}
		}
		return -1;
	}

	function findLastSource(){
		if(nodes.length === 0 ) return -1;
		for (var i = nodes.length -1; i >= 0; i--){
			if(nodes[i].group === "i") return i;  
		};
		return -1;
	}
	
	var lastSource = findLastSource();
	for(var j = 0; j < g.length; j++){
		var first = g[j];
		if(contains(nodes, {name:first.input, group: "i"}) !== -1) {continue;}
		nodes.push({"name":first.input, "group":"i"});
		if(lastSource !== -1){ links.push({"source": lastSource, "target": nodes.length - 1, "weight":1});}
		var source = nodes.length - 1;
		lastSource = source;
		for(var type in first.output){
			var innerCount = 0;
			var vals = first.output[type];
			var max = vals.length;
			if(vals.length > 5){ max = 5;}
			for(var i = 0; i< max; i++){
				innerCount++;
				if(innerCount > 10){ break;}
				var val = vals[i];
				//var toInsert = count;
				/*var inArray = contains(nodes, {name:val[0],group:type});
				if(inArray !== -1){
					toInsert = inArray;
				}else{
					*/
					nodes.push({"name": val[0], "group": type});
				//}
				links.push({"source": source, "target": nodes.length -1, "value":val[1]});
			}
		}
	}
}

var d3graph = {nodes:[], links:[]};

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
.call(zoom);

var rect = svg.append("rect")
.attr("width", width)
.attr("height", height)
.style("fill", "none")
.style("pointer-events", "all");

var container = svg.append("g");

var force = d3.layout.force()
.gravity(0.5)
.distance(60)
.charge(-2000)
.chargeDistance(300)
.on("tick", tick)
.nodes(d3graph.nodes)
.links(d3graph.links)
.size([width, height])
.start();

var nodes = force.nodes(),
links = force.links(),
node = container.selectAll("g.node"),
link = container.selectAll(".link");

restart();

function tick() {
	link.attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });

	node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}

function restart(){
	link = link.data(links);
	node = node.data(nodes);
	force.start();

	link.exit().remove();


	link.enter().append("line")
	.attr("class", "link")
	.style("stroke-width", function(d) {
		//return 1;
		if(d.source.group === "i" && d.target.group === "i"){ return 1;}
		else {return 0;}
	});

	

	node.exit().remove();

	node.enter().append("g")
	.attr("class", "node")
	.classed('node', true);

	node.append("circle")
	.attr("r", function(d){
		if(d.group === "i"){ return 25;}
		return 20 + d.weight*5;
	})
	.style("fill", function(d) { 
		if(d.group === 'o'){
			return "#ff9896";
		}else if(d.group === 'i'){
			return "#a1d99b";
		}else if(d.group[0] === 'a'){
			return "#fdd0a2";
		}
		else{
			return "#ade";
		}
	});

	node.append("svg:text")
	.attr("text-anchor", "middle")
	.text(function(d) { return d.name; });	

	
}

var numSoFar = 0;

function addToD3(newNode){
	function findLastSource(){
		if(nodes.length === 0 ) return 0;
		for (var i = nodes.length -1; i >= 0; i--){
			if(nodes[i].group === "i") return i;  
		};
		return 0;
	}

	var lastSource = findLastSource();
	nodes.push({"name":newNode.input, "group":"i"});
	if(lastSource !== -1){ links.push({"source": lastSource, "target": nodes.length - 1, "weight":1}); }
	/*
	connectToLastSourceNode();
	connectToRemainingNodes();
	removeLinksBeforeLastNode();
	*/
}
