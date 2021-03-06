///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  /**
   * An AreaPlot draws a filled region (area) between the plot's projected "y" and projected "y0" values.
   */
  export class Area extends Line {
    private areaPath: D3.Selection;

    /**
     * Creates an AreaPlot.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale) {
      super(dataset, xScale, yScale);
      this.classed("area-plot", true);
      this.project("y0", 0, yScale); // default
      this.project("fill", () => Core.Colors.INDIGO); // default
      this.project("fill-opacity", () => 0.25); // default
      this.project("stroke", () => Core.Colors.INDIGO); // default
      this._animators["area-reset"] = new Animator.Null();
      this._animators["area"]       = new Animator.Default()
                                        .duration(600)
                                        .easing("exp-in-out");
    }

    public _appendPath() {
      this.areaPath = this.renderArea.append("path").classed("area", true);
      super._appendPath();
    }

    public _onDataSourceUpdate() {
      super._onDataSourceUpdate();
      if (this.yScale != null) {
        this._updateYDomainer();
      }
    }

    public _updateYDomainer() {
      super._updateYDomainer();
      var scale = <Abstract.QuantitativeScale> this.yScale;

      var y0Projector = this._projectors["y0"];
      var y0Accessor = y0Projector != null ? y0Projector.accessor : null;
      var extent:  number[] = y0Accessor != null ? this.dataSource()._getExtent(y0Accessor) : [];
      var constantBaseline = (extent.length === 2 && extent[0] === extent[1]) ? extent[0] : null;

      if (!scale._userSetDomainer) {
        if (constantBaseline != null) {
          scale.domainer().addPaddingException(constantBaseline, "AREA_PLOT+" + this._plottableID);
        } else {
          scale.domainer().removePaddingException("AREA_PLOT+" + this._plottableID);
        }
        // prepending "AREA_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        scale._autoDomainIfAutomaticMode();
      }
    }

    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale) {
      super.project(attrToSet, accessor, scale);
      if (attrToSet === "y0") {
        this._updateYDomainer();
      }
      return this;
    }

    public _getResetYFunction() {
      return this._generateAttrToProjector()["y0"];
    }

    public _paint() {
      super._paint();
      var attrToProjector = this._generateAttrToProjector();
      var xFunction       = attrToProjector["x"];
      var y0Function      = attrToProjector["y0"];
      var yFunction       = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y0"];
      delete attrToProjector["y"];

      this.areaPath.datum(this._dataSource.data());

      if (this._dataChanged) {
        attrToProjector["d"] = d3.svg.area()
          .x(xFunction)
          .y0(y0Function)
          .y1(this._getResetYFunction());
        this._applyAnimatedAttributes(this.areaPath, "area-reset", attrToProjector);
      }

      attrToProjector["d"] = d3.svg.area()
        .x(xFunction)
        .y0(y0Function)
        .y1(yFunction);
      this._applyAnimatedAttributes(this.areaPath, "area", attrToProjector);
    }

    public _wholeDatumAttributes() {
      var wholeDatumAttributes = super._wholeDatumAttributes();
      wholeDatumAttributes.push("y0");
      return wholeDatumAttributes;
    }

  }
}
}
