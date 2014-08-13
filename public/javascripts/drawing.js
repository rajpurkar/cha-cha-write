var Graph = function(g){
	return { 
		draw: function(){
			var color = d3.scale.category20();
			var width = parseInt(d3.select('#d3div').style('width'), 10),
				height = parseInt(d3.select('#d3div').style('height'), 10);


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
      		//.attr("transform", "translate(" + 0 + "," + 0 + ")")
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
			/*.linkStrength(function(link){
				return Math.sqrt(link)/1000;
			})
			*/
			.size([width, height]);
			var json = g;
			force
			.nodes(json.nodes)
			.links(json.links)
			.start();

			var link = container.selectAll(".link")
			.data(json.links)
			.enter().append("line")
			.attr("class", "link")
			.style("stroke-width", function(d) {
				return 1;
				if(d.source.group === "i" && d.target.group === "i"){ return 1;}
				else return 0;
			});

			var node = container.selectAll("g.gnode")
			.data(json.nodes)
			.enter().append("g")
			.attr("class", "node")
			.classed('gnode', true)
			//.call(force.drag);

			node.append("circle")
			.attr("r", 25)
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
				}});

			node.append("svg:text")
			.attr("text-anchor", "middle")
			.text(function(d) { return d.name; });

			force.on("tick", function() {
				link.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });

				node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
			});
		}, convertGraph: function(){
			function checkInArray(){
				return true;
			}
			//only doing the first one
			var out = {"nodes": [], "links": []};
			var count = 0;
			var lastSource = -1;
			for(var j = 0; j < g.length; j++){
				var first = g[j];
				out.nodes.push({"name":first.input, "group":'i'});
				if(lastSource !== -1){ out.links.push({"source": lastSource, "target":out.nodes.length - 1, "value":10});}
				count++;
				var source = out.nodes.length - 1;
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
						var toInsert = count;

						var inArray = out.nodes.indexOf({"name": val[0], "group": type});
						if(inArray !== -1){
							toInsert = inArray;
						}else{
							out.nodes.push({"name": val[0], "group": type});
							count++;
						}
						out.links.push({"source": source, "target":toInsert, "value":val[1]});
					}
				}
			};
			g = out;
			console.log(g);
		}
	};
};