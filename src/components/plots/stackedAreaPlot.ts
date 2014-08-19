///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class StackedArea extends Abstract.NewStylePlot {

    private stackedData: any[][] = [];
    public _baseline: D3.Selection;
    public _baselineValue = 0;
    public _isVertical = true;
    private stackedExtent: number[] = [];

    /**
     * Creates a StackedArea plot.
     *
     * @constructor
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(xScale: Abstract.Scale, yScale: Abstract.Scale) {
      super(xScale, yScale);
      this.classed("area-plot", true);
      this.project("fill", () => Core.Colors.INDIGO);
    }

    public _getDrawer(key: string) {
      return new Plottable._Drawer.Area(key);
    }

    public _setup() {
      super._setup();
      this._baseline = this.renderArea.append("line").classed("baseline", true);
    }

    public _paint() {
      super._paint();

      var primaryScale = this.yScale;
      var scaledBaseline = primaryScale.scale(this._baselineValue);
      var baselineAttr: IAttributeToProjector = {
        "x1": 0,
        "y1": scaledBaseline,
        "x2": this.availableWidth,
        "y2": scaledBaseline
      };
      this._applyAnimatedAttributes(this._baseline, "baseline", baselineAttr);

      var attrToProjector = this._generateAttrToProjector();
      var xFunction       = attrToProjector["x"];
      var y0Function      = attrToProjector["y0"];
      var yFunction       = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y0"];
      delete attrToProjector["y"];

      attrToProjector["d"] = d3.svg.area()
        .x(xFunction)
        .y0(y0Function)
        .y1(yFunction);

      this._getDrawersInOrder().forEach((d, i) => d.draw([this.stackedData[i]], attrToProjector));
    }

    public _updateYDomainer() {
      return Plot.Area.prototype._updateYDomainer.apply(this);
    }

    public _addDataset(key: string, dataset: any) {
      super._addDataset(key, dataset);
      this.stackedData = this.stack(this._projectors["y"].accessor);
    }

    public _onDataSourceUpdate() {
      return Plot.Area.prototype._onDataSourceUpdate.apply(this);
    }

    public _updateAllProjectors() {
      super._updateAllProjectors();
      if (this.yScale == null) {
        return;
      }
      if (this._isAnchored && this.stackedExtent.length > 0) {
        this.yScale.updateExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT", this.stackedExtent);
      } else {
        this.yScale.removeExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT");
      }
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      var primaryScale    = this._isVertical ? this.yScale : this.xScale;
      var getY0 = (d: any) => primaryScale.scale(d._PLOTTABLE_PROTECTED_FIELD_Y0);
      var getY = (d: any) => primaryScale.scale(d._PLOTTABLE_PROTECTED_FIELD_Y);
      attrToProjector["y"] = (d) => getY(d);
      attrToProjector["y0"] = (d) => getY0(d);
      return attrToProjector;
    }

    private stack(accessor: IAccessor) {
      var datasets = d3.values(this._key2DatasetDrawerKey);
      var lengths = datasets.map((d) => d.dataset.data().length);
      if (Util.Methods.uniqNumbers(lengths).length > 1) {
        Util.Methods.warn("Warning: Attempting to stack data when datasets are of unequal length");
      }
      var currentBase = Util.Methods.createFilledArray(0, lengths[0]);
      var stacks = this._getDatasetsInOrder().map((dataset) => {
        var data = dataset.data();
        var base = currentBase.slice();
        var vals = data.map(accessor);
        if (vals.some((x: number) => x<0)) {
          Util.Methods.warn("Warning: Behavior for stacked area undefined when data includes negative values");
        }
        currentBase = Util.Methods.addArrays(base, vals);

        return data.map((d: any, i: number) => {
          d["_PLOTTABLE_PROTECTED_FIELD_Y0"] = base[i];
          d["_PLOTTABLE_PROTECTED_FIELD_Y"] = currentBase[i];
          return d;
        });
      });
      this.stackedExtent = [0, d3.max(currentBase)];
      this._onDataSourceUpdate();
      return stacks;
    }
  }
}
}