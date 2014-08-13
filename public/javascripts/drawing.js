var Graph = function(g){
	return { 
		draw: function(){
			var color = d3.scale.category20();
			var width = parseInt(d3.select('#d3div').style('width'), 10);
			var height = parseInt(d3.select('#d3div').style('height'), 10);
			
			var zoom = d3.behavior.zoom()
			.scaleExtent([0.1, 20])
			.on("zoom", zoomed);

			var drag = d3.behavior.drag()
			.origin(function(d) { return d; })
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
			.on("tick", tick)
			.nodes(g.nodes)
			.links(g.links)
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
				
				link.enter().append("line")
				.attr("class", "link")
				.style("stroke-width", function(d) {
					//return 1;
					if(d.source.group === "i" && d.target.group === "i"){ return 1;}
					else {return 0};
				});

				node = node.data(nodes);
				
				node.enter().append("g")
				.attr("class", "node")
				.classed('node', true);

				node.append("circle")
				.attr("r", function(d){
					if(d.group === "i"){ return 25;};
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
				
				force.start();
			}
		}
	};
};