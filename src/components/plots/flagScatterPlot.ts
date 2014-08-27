///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class FlagScatter extends Abstract.XYPlot {
    private clickCallback: (d: any, i: number) => void;

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
      attrToProjector["d"] = () => "m0,0L20,0L20,-15L0,-15L0,10z";
      attrToProjector["stroke"] = () => "#C9CBCB";
      attrToProjector["stroke-width"] = () => "1px";
      attrToProjector["fill"] = () => "#EDF0F2";
      delete attrToProjector["x"];
      delete attrToProjector["y"];
      var containerAttrToProjector = this._generateAttrToProjector();
      containerAttrToProjector["class"] = () => "graph-event-flag";
      // TODO (styu): get rid of magic numbers
      containerAttrToProjector["transform"] = (d, i) => {
          var x = xFunction(d, i);
          var y = yFunction(d, i) + 20;
          return "translate(" + x + "," + y + ")";
      }
      delete containerAttrToProjector["x"];
      delete containerAttrToProjector["y"];
      var textAttrToProjector = this._generateAttrToProjector();
      textAttrToProjector["font-family"] = () => "BlenderPro-Book";
      textAttrToProjector["fill"] = () => "#545758";
      textAttrToProjector["x"] = (d, i) => { // Centering
          if (d.name.length == 1)
              return 7;
          else
              return 2; // Hacky
      };
      textAttrToProjector["y"] = () => -3; // Centering
      var flagContainers = this.renderArea.selectAll("g").data(this._dataSource.data());
      var container = flagContainers.enter().append("g");
      container.on("click", (d, i) => { this.clickCallback(d, i); });
      var flags = container.append("path");
      var text = container.append("text");
      text.text((d: any) => d.name ? d.name : "";);
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
