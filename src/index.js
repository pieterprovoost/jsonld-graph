// Based on https://observablehq.com/@xianwu/force-directed-graph-network-graph-with-arrowheads-and-lab#d3

import * as d3 from "d3";
export { generateGraph } from "./graph";

export class JsonldViz {
    constructor(config, data) {
        this.config = {
            parentElement: config.parentElement,
            width: config.width || 1140,
            height: config.height || 750,
            margin: {top: 30, right: 80, bottom: 5, left: 5}
        }
        this.data = data;
        this.update();
    }

    update() {

        document.getElementById(this.config.parentElement.replace("#", "")).innerHTML = "";

        const colorScale = d3.scaleOrdinal()
            .range(["#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#e6f598", "#abdda4", "#66c2a5", "#3288bd"]);
        
        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance(150)) 
            .force("charge", d3.forceManyBody().strength(-180))
            .force("center", d3.forceCenter(this.config.width / 2, this.config.height / 2));
            
        const svg = d3.select(this.config.parentElement).append("svg")
            .attr("width", this.config.width + this.config.margin.left + this.config.margin.right)
            .attr("height", this.config.height + this.config.margin.top + this.config.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.config.margin.left}, ${this.config.margin.top})`);
        
        function handleZoom(e) {
            svg.attr('transform', e.transform);
        }
        let zoom = d3.zoom().on('zoom', handleZoom);
        d3.select(this.config.parentElement).select("svg").call(zoom);
        
        svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "-0 -5 10 10")
            .attr("refX", 23)
            .attr("refY", 0)
            .attr("orient", "auto")
            .attr("markerWidth", 13)
            .attr("markerHeight", 13)
            .attr("xoverflow", "visible")
            .append("svg:path")
            .attr("d", "M 0,-5 L 10 ,0 L 0,5")
            .attr("fill", "#999")
            .style("stroke", "none");
                  
        const link = svg.selectAll(".links")
            .data(this.data.links)
            .enter()
            .append("line")
            .attr("class", "links")
            .attr("marker-end", "url(#arrowhead)");
        
        link.append("title").text(d => d.type);
          
        const edgepaths = svg.selectAll(".edgepath")
            .data(this.data.links)
            .enter()
            .append("path")
            .attr("class", "edgepath")
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .attr("id", function (d, i) {return "edgepath" + i})
            .style("pointer-events", "none");
        
        const edgelabels = svg.selectAll(".edgelabel")
            .data(this.data.links)
            .enter()
            .append("text")
            .style("pointer-events", "none")
            .attr("class", "edgelabel")
            .attr("id", function (d, i) {return "edgelabel" + i})
            .attr("font-size", 10)
            .attr("fill", "#aaa");
          
        edgelabels.append("textPath")
            .attr("xlink:href", function (d, i) {return "#edgepath" + i})
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text(d => d.type);
            
        const node = svg.selectAll(".nodes")
            .data(this.data.nodes)
            .enter()
            .append("g")
            .attr("class", "nodes")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
            );
          
        node.append("circle")
            .attr("r", d => 17)
            .style("stroke", "grey")
            .style("stroke-opacity", 0.3)
            .style("stroke-width", d => 10)
            .style("fill", d => colorScale(d.group))
          
        node.append("title")
            .text(d => d.id + ": " + d.label + " - " + d.group);
          
        node.append("text")
            .attr("dy", 3)
            .attr("dx", 0)
            .text(d => d.name);
        
        node.append("text")
            .attr("dy", 12)
            .attr("dx", 0)
            .text(d => d.group);
          
        simulation.nodes(this.data.nodes)
            .on("tick", ticked);
          
        simulation.force("link")
            .links(this.data.links);
          
        function ticked() {
            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            node.attr("transform", d => `translate(${d.x},${d.y})`);
            edgepaths.attr('d', d => 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y);
        }
        
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fy = d.y;
            d.fx = d.x;
        }
          
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

    }
}

