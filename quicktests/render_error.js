function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
}

function _run(div, data, Plottable) {
  var doAnimate = true;
  var areaRenderer;
  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  areaRenderer = new Plottable.Plot.Area(data[0].slice(0, 20), xScale, yScale);
  areaRenderer.project("opacity", 0.75);
  areaRenderer.animate(doAnimate);

  var areaChart = new Plottable.Component.Table([[yAxis, areaRenderer],
                                           [null,  xAxis]]);
  var svg = div.append("svg").attr("height", 500);
  areaChart.renderTo(svg);

  cb = function(x, y){
    d = areaRenderer.dataSource().data();
    areaRenderer.dataSource().data(d);
  }

  window.xy = new Plottable.Interaction.Click(areaRenderer)
    .callback(cb)
    .registerWithComponent();
}

function foo() {
  bar();
}

var n = 0;

function bar() {
  throw new Error("foo " + (n++));
}

function run(div, data, Plottable) {
  var doRender = Plottable.Plot.Area._doRender;
  var n = 0;
  Plottable.Plot.Area.prototype._doRender = foo;
  _run(div, data, Plottable);
  setTimeout(function() {
    Plottable.Plot.Area._doRender = doRender;
    console.log("fixed it now?");
    _run(div, data, Plottable);
  }, 100);
}
