// initial setup
const svg = d3.select("svg"),
  width = svg.attr("width"),
  height = svg.attr("height"),
  path = d3.geoPath(),
  data = d3.map(),
  worldmap =
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
  mlopsWorld = "mlops_world.csv";

let centered;

// style of geographic projection and scaling
const projection = d3
  .geoRobinson()
  .scale(130)
  .translate([width / 2, height / 2]);

const colorScale = d3
  .scaleThreshold()
  .domain([1, 10, 20, 50, 100])
  .range(d3.schemeOrRd[7]);

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Load external data and boot "for the world Map"
d3.queue()
  .defer(d3.json, worldmap)
  .defer(d3.csv, mlopsWorld, function (d) {
    data.set(d.code, +d.pop);
  })
  .await(ready);

function ready(error, topo) {
  if (error) throw error;

  // Draw the map
  svg
    .append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
    .attr("d", path.projection(projection))
    .attr("fill", function (d) {
      d.total = data.get(d.id) || 0;
      return colorScale(d.total);
    })
    .on("mouseover", function (d) {
      d3.select(this).style("opacity", 0.5);
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(d.properties.name + ": " + (d.total || 0) + " applications")
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).style("opacity", 1);
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Draw legend "The scale"
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + 0 + ",280)");

  const legendItemSize = 20;
  const legendSpacing = 5;

  colorScale.domain().forEach(function (d, i) {
    const legendItem = legend
      .append("g")
      .attr("class", "legend-item")
      .attr(
        "transform",
        "translate(0," + i * (legendItemSize + legendSpacing) + ")"
      );

    // Draw the colored rectangle
    legendItem
      .append("rect")
      .attr("width", legendItemSize)
      .attr("height", legendItemSize)
      .style("fill", colorScale(d))
      .style("opacity", 0.8);

    // Add text label to the right of the rectangle
    legendItem
      .append("text")
      .attr("x", legendItemSize + legendSpacing)
      .attr("y", legendItemSize - legendSpacing)
      .text(function () {
        if (i === colorScale.domain().length - 1) {
          return "> " + d + " applications";
        }
        return d + " - " + colorScale.domain()[i + 1] + " applications";
      });
  });

  legend
    .append("text")
    .attr("class", "legend-title")
    .attr("x", 0)
    .attr("y", -10)
    .text("Job Applications");
}
