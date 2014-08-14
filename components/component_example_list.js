///<reference path="exampleReference.ts" />
var ordinalDomain = ["a", "b", "c", "d", "e"];
var ordinalData = [{ x: "a", y: 3 }, { x: "b", y: -2 }, { x: "c", y: 4 }, { x: "d", y: -3 }, { x: "e", y: 5 }];
var quantitativeData = [{ x: -2, y: 15 }, { x: 1, y: 20 }, { x: 4, y: -3 }, { x: 8, y: 0 }, { x: 10, y: -10 }];
var quantitativeData2 = [{ x: -2, y: 20 }, { x: 5, y: -10 }, { x: 7, y: 10 }, { x: 10, y: 7 }];
var colors = new Plottable.Scale.Color("Category10").range();

function makeTitle(text) {
    return new Plottable.Component.Label(text, "horizontal");
}

function axis(type, orientation) {
    var axis;
    if (type === "numeric") {
        var lscale = new Plottable.Scale.Linear();
        axis = new Plottable.Axis.Numeric(lscale, orientation);
    } else if (type === "category") {
        var oscale = new Plottable.Scale.Ordinal();
        oscale.domain(ordinalDomain);
        axis = new Plottable.Axis.Category(oscale, orientation);
    } else if (type === "time") {
        var tscale = new Plottable.Scale.Time();
        tscale.domain([new Date(2014, 0, 0), new Date(2015, 0, 0)]);
        axis = new Plottable.Axis.Time(tscale, orientation);
    } else {
        throw new Error("unrecognized type: " + type);
    }
    return axis;
}

function verticalBarPlot() {
    var xScale = new Plottable.Scale.Ordinal();
    var yScale = new Plottable.Scale.Linear();

    xScale.domain(ordinalDomain);

    var ds = new Plottable.DataSource(ordinalData);
    var plot = new Plottable.Plot.VerticalBar(ds, xScale, yScale);
    plot.animate(true);
    return plot;
}

function horizontalBarPlot() {
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Ordinal();

    yScale.domain(ordinalDomain);
    var ds = new Plottable.DataSource(ordinalData);

    // need to reverse the x/y data
    var plot = new Plottable.Plot.HorizontalBar(ds, xScale, yScale).project("x", "y", xScale).project("y", "x", yScale);
    plot.animate(true);
    return plot;
}

function gridPlot() {
    var xScale = new Plottable.Scale.Ordinal();
    var yScale = new Plottable.Scale.Ordinal();
    var colorScale = new Plottable.Scale.InterpolatedColor();

    xScale.domain(["a", "b", "c"]);
    yScale.domain(["d", "e", "f"]);
    colorScale.domain([0, 10]);
    var data = [
        { x: "a", y: "d", value: 3 }, { x: "a", y: "e", value: 4 }, { x: "a", y: "f", value: 7 },
        { x: "b", y: "d", value: 1 }, { x: "b", y: "e", value: 6 }, { x: "b", y: "f", value: 8 },
        { x: "c", y: "d", value: 9 }, { x: "c", y: "e", value: 2 }, { x: "c", y: "f", value: 5 }];

    var plot = new Plottable.Plot.Grid(data, xScale, yScale, colorScale);
    return plot;
}

function getXYPlot(type, data) {
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var ds = new Plottable.DataSource(data);

    var plot;
    switch (type) {
        case "area":
            plot = new Plottable.Plot.Area(ds, xScale, yScale);
            break;
        case "line":
            plot = new Plottable.Plot.Line(ds, xScale, yScale);
            break;
        case "scatter":
            plot = new Plottable.Plot.Scatter(ds, xScale, yScale);
            plot.project("r", 7);
            break;
    }
    plot.animate(true);
    return plot;
}

function makeXYPlot(type) {
    return getXYPlot(type, quantitativeData);
}

function makeXYPlotMulti(type) {
    var plot = getXYPlot(type, quantitativeData);
    var plot2 = getXYPlot(type, quantitativeData2);
    if (type === "line") {
        plot.project("stroke", colors[0]);
        plot2.project("stroke", colors[1]);
    } else {
        plot.project("fill", colors[0]);
        plot2.project("fill", colors[1]);
    }
    var group = new Plottable.Component.Group([plot, plot2]);
    return group;
}

function makeAreaStroke() {
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var ds = new Plottable.DataSource(quantitativeData);

    var plot = new Plottable.Plot.Area(ds, xScale, yScale);
    plot.project("stroke", colors[0]);
    plot.project("fill", colors[0]);
    return plot;
}

function label(text, orientation) {
    return new Plottable.Component.Label(text, orientation);
}

function legend() {
    var colorScale = new Plottable.Scale.Color("category10");
    var legend = new Plottable.Component.Legend(colorScale);
    legend.toggleCallback(function () {
        return;
    }); // empty function, just to turn toggling on
    legend.hoverCallback(function () {
        return;
    });
    legend.scale().domain(ordinalDomain);
    return legend;
}

function gridline(showVertical, showHorizontal) {
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();

    var gridlines = new Plottable.Component.Gridlines(showVertical ? xScale : null, showHorizontal ? yScale : null);
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");
    var table = new Plottable.Component.Table([[yAxis, gridlines], [null, xAxis]]);
    return table;
}

function animate1() {
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();

    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");

    var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
    var plot1 = new Plottable.Plot.Line(quantitativeData, xScale, yScale).animate(true);
    var plot2 = new Plottable.Plot.Line(quantitativeData2, xScale, yScale).animate(true);

    plot1.project("stroke", colors[0]);
    plot2.project("stroke", colors[1]);

    var renderGroup = new Plottable.Component.Group([plot1, plot2, gridlines]);
    var table = new Plottable.Component.Table([[yAxis, renderGroup], [null, xAxis]]);
    return table;
}

function animate2() {
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();

    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");

    var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
    var plot1 = new Plottable.Plot.Area(quantitativeData, xScale, yScale).animate(true);
    var plot2 = new Plottable.Plot.Area(quantitativeData2, xScale, yScale).animate(true);

    plot1.project("fill", colors[0]);
    plot2.project("fill", colors[1]);

    var renderGroup = new Plottable.Component.Group([plot1, plot2, gridlines]);
    var table = new Plottable.Component.Table([[yAxis, renderGroup], [null, xAxis]]);
    return table;
}

function animate3() {
    var xScale = new Plottable.Scale.Ordinal();
    var yScale = new Plottable.Scale.Linear();

    var xAxis = new Plottable.Axis.Category(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");

    var plot1 = new Plottable.Plot.VerticalBar(ordinalData, xScale, yScale).animate(true);

    var table = new Plottable.Component.Table([[yAxis, plot1], [null, xAxis]]);
    return table;
}
