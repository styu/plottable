d3.tsv("data.tsv", function(error, data) {
  var parseDate = d3.time.format("%Y%m%d").parse;
  var cityNames = d3.keys(data[0]).filter(function(key) { return key !== "date"; });
  var cities = cityNames.map(function(name) {
    return data.map(function(d) {
        return {date: parseDate(d.date), temperature: +d[name], name: name};
      });
  });

  var xScale = new Plottable.Scale.Time();
  var yScale = new Plottable.Scale.Linear();
  var colorScale = new Plottable.Scale.Color("10");

  var xAxis  = new Plottable.Axis.Time(xScale, "bottom");
  var yAxis  = new Plottable.Axis.Numeric(yScale, "left");
  var yLabel = new Plottable.Component.Label("Temperature (ºF)", "left");
  var legend = new Plottable.Component.Legend(colorScale);

  var plots = cities.map(function(city) {
    return new Plottable.Plot.Line(city, xScale, yScale)
                      .project("x", "date", xScale)
                      .project("y", "temperature", yScale)
                      .project("stroke", colorScale.scale(city[0].name))
                      .project("stroke-width", 1);
    });

  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var center = new Plottable.Component.Group(plots).merge(gridlines).merge(legend);
  var table = new Plottable.Component.Table([[yLabel, yAxis, center], [null, null, xAxis]]).renderTo("svg");
  new Plottable.Interaction.PanZoom(center, xScale, new Plottable.Scale.Linear()).registerWithComponent();
});
