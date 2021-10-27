let width = 1000,
height = 700;

margin = ({top: 3, right: 45, bottom: 40, left: 30});

const svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width",width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + margin.left*0.12 + "," + margin.top + ")");


// Load CSV file
d3.csv("driving.csv").then(data => {  
    console.log(data);
    let milesMin = d3.min(data, d => d.miles);
    let milesMax = d3.max(data, d => d.miles);
    // x and y scales
    let x = d3.scaleLinear()
        .domain([3500,milesMax]).nice()
        .range([margin.left, width - margin.right]);
    let y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.gas)).nice()
        .range([height - margin.bottom, margin.top]);
 
    // connecting the dots
    line = d3.line()
        .curve(d3.curveCatmullRom)
        .x(d => x(d.miles))
        .y(d => y(d.gas));

    const l = length(line(data));
    
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width",2.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", `0,${l}`)
        .attr("d", line)
    .transition()
        .duration(5000)
        .ease(d3.easeLinear)
        .attr("stroke-dasharray", `${l},${l}`);


    // generate axes
    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("y2", -height)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", width - 4)
            .attr("y", -4)
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("fill", "black")
            .text("Miles per person per year")
            .call(halo)
            );
    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(null, "$.2f"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width)
            .attr("stroke-opacity", 0.1))
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .text("Cost per gallon")
            .call(halo)
            ); 
               
    svg.append("g")
        .call(xAxis);
    svg.append("g")
        .call(yAxis);

    const datapoints = svg.append("g") 
        .selectAll("circle")
        .data(data)
        .enter()
     

    // chart
    // add circles
    datapoints.append("circle")
        .attr("cx", d => x(d.miles))
        .attr("cy", d => y(d.gas))
        .attr("r", 3.5)
        .style("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .call(halo);
  
    
    // create labels & avoid overlaps between labels
    let label = datapoints.append("text")
        .text(d => d.year)
        .attr("font-family", "sans-serif")
        .attr("font-size",10)
        .attr("opacity",0)
        .attr("transform", d => `translate(${x(d.miles)},${y(d.gas)})`) 
        .each(function(d) {
          const t = d3.select(this);
          switch (d.side) {
            case "top": t.attr("text-anchor", "middle").attr("dy", "-0.7em"); break;
            case "right": t.attr("dx", "0.5em").attr("dy", "0.32em").attr("text-anchor", "start"); break;
            case "bottom": t.attr("text-anchor", "middle").attr("dy", "1.4em"); break;
            case "left": t.attr("dx", "-0.5em").attr("dy", "0.32em").attr("text-anchor", "end"); break;
          }
        })
        .call(halo);

    // function halo
    function halo(text) {
        text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round");
        };


    
    label.transition()
        .delay((d,i) => length(line(data.slice(0, i + 1))) / l*(5000-125))
        .attr("opacity",1);
   
    
    function length(path) {
        return d3.create("svg:path").attr("d", path).node().getTotalLength();
      }
});  