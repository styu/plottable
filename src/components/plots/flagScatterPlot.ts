///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class FlagScatter extends Abstract.XYPlot {
    private clickCallback: (d: any, i: number) => void;
    private FLAG_WIDTH: number = 20;
    private FLAG_HEIGHT: number = 15;
    private CENTER_RATIO: number = 3/8;

    public _animators: Animator.IPlotAnimatorMap = {
      "flags-reset"      : new Animator.Null(),
      "flags"            : new Animator.IterativeDelay()
        .duration(250)
        .delay(5),
      "flags-text"       : new Animator.IterativeDelay()
        .duration(250)
        .delay(5),
       "flags-container"       : new Animator.IterativeDelay()
        .duration(250)
        .delay(5)
    };

    /**
     * Creates a FlagScatterPlot.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale, clickCallback: (d: any, i: number) => void) {
      super(dataset, xScale, yScale);
      this.classed("scatter-plot", true);
      this.clickCallback = clickCallback;
    }

    public _paint() {
      super._paint();
      var attrToProjector = this._generateAttrToProjector();
      var xFunction = attrToProjector["x"];
      var yFunction = attrToProjector["y"];
      attrToProjector["d"] = () => "m0,-10L" + this.FLAG_WIDTH + ",-10L" + this.FLAG_WIDTH + ",-25L0,-25L0,0z";
      attrToProjector["stroke"] = () => "#C9CBCB";
      attrToProjector["stroke-width"] = () => "1px";
      attrToProjector["fill"] = () => "#EDF0F2";
      delete attrToProjector["x"];
      delete attrToProjector["y"];
      var containerAttrToProjector = this._generateAttrToProjector();
      containerAttrToProjector["class"] = () => "graph-event-flag";
      containerAttrToProjector["transform"] = (d, i) => {
          var x = xFunction(d, i);
          var y = yFunction(d, i);
          return "translate(" + x + "," + y + ")";
      }
      delete containerAttrToProjector["x"];
      delete containerAttrToProjector["y"];
      var textAttrToProjector = this._generateAttrToProjector();
      textAttrToProjector["font-family"] = () => "BlenderPro-Book";
      textAttrToProjector["fill"] = () => "#545758";
      textAttrToProjector["x"] = (d, i) => { // Centering
          return Math.floor(this.FLAG_WIDTH * this.CENTER_RATIO / d.name.length);
      };
      textAttrToProjector["y"] = () => -this.FLAG_HEIGHT; // Centering
      var flagContainers = this.renderArea.selectAll("g").data(this._dataSource.data());
      var container = flagContainers.enter().append("g");
      container.on("click", (d, i) => {
        if (containerAttrToProjector["class"](d, i).indexOf("active") >= 0) {
            containerAttrToProjector["class"] = () => "graph-event-flag";
        } else {
            containerAttrToProjector["class"] = () => "graph-event-flag active";
        }
        this._applyAnimatedAttributes(flagContainers, "flags-reset", containerAttrToProjector);
        this.clickCallback(d, i);
      });
      var flags = container.append("path");
      var text = container.append("text");
      text.text((d: any) => d.name ? d.name : "");
      if (this._dataChanged) {
          this._applyAnimatedAttributes(flagContainers, "flags-reset", containerAttrToProjector);
      }
      this._applyAnimatedAttributes(flags, "flags", attrToProjector);
      this._applyAnimatedAttributes(flagContainers, "flags-container", containerAttrToProjector);
      this._applyAnimatedAttributes(text, "flags-text", textAttrToProjector);
      flagContainers.exit().remove();
    }
  }
}
}
