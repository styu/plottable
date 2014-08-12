function makeBarChart(authorData) {
  // Make the scales
  var xScale = new Plottable.Scale.Ordinal();
  var yScale = new Plottable.Scale.Linear().domain([0, 1000]);
  var colorScale = new Plottable.Scale.Color("20")
      .domain(["Daniel Mane", "Justin Lan", "Ashwin Ramaswamy", "Bill Dwyer", "crmorford", "Brian Malehorn", "lewin"  , "other"])
      .range(["#ff7f0e"     , "#1f77b4"   , "#2ca02c"         , "#d62728"   , "#9467bd"  , "#8c564b"       , "#e377c2", "#000"]);

  var bar = new Plottable.Plot.VerticalBar(authorData, xScale, yScale)
                      .project("x", "authorName", xScale)
                      .project("y", "numCommits", yScale)
                      .project("fill", "authorName", colorScale)
                      .animate(true);
  var gridlines = new Plottable.Component.Gridlines(null, yScale);

  var center = gridlines.merge(bar);
  var xAxis = new Plottable.Axis.Category(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  new Plottable.Template.StandardChart().center(center).xAxis(xAxis).yAxis(yAxis)
            .titleLabel("Number of Commits By Contributor").renderTo("svg");
}
