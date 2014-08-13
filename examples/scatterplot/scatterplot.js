d3.tsv("data.tsv", function(error, data) {
  data.forEach(function(d) {
     d.sepalLength = +d.sepalLength;
     d.sepalWidth = +d.sepalWidth;
   });
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  var colorScale = new Plottable.Scale.Color("10");

  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var xLabel = new Plottable.Component.Label("Sepal Width (cm)");
  var yLabel = new Plottable.Component.Label("Sepal Length (cm)", "left");
  var legend = new Plottable.Component.Legend(colorScale);
  var plot = new Plottable.Plot.Scatter(data, xScale, yScale)
                      .project("x", "sepalWidth", xScale)
                      .project("y", "sepalLength", yScale)
                      .project("fill", "species", colorScale);
  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var center = plot.merge(gridlines).merge(legend);
  var table = new Plottable.Component.Table([[yLabel, yAxis, center], [null, null, xAxis], [null, null, xLabel]]).renderTo("svg");
});
