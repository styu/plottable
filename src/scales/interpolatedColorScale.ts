///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  interface ColorGroups {
    [key: string]: string[];
  };

  /**
   * This class implements a color scale that takes quantitive input and
   * interpolates between a list of color values. It returns a hex string
   * representing the interpolated color.
   *
   * By default it generates a linear scale internally.
   */
  export class InterpolatedColor extends Abstract.QuantitativeScale {
    private static COLOR_SCALES: ColorGroups = {
      reds : [
        "#FFFFFF", // white
        "#FFF6E1",
        "#FEF4C0",
        "#FED976",
        "#FEB24C",
        "#FD8D3C",
        "#FC4E2A",
        "#E31A1C",
        "#B10026"  // red
      ],
      blues : [
        "#FFFFFF", // white
        "#CCFFFF",
        "#A5FFFD",
        "#85F7FB",
        "#6ED3EF",
        "#55A7E0",
        "#417FD0",
        "#2545D3",
        "#0B02E1"  // blue
      ],
      posneg : [
        "#0B02E1", // blue
        "#2545D3",
        "#417FD0",
        "#55A7E0",
        "#6ED3EF",
        "#85F7FB",
        "#A5FFFD",
        "#CCFFFF",
        "#FFFFFF", // white
        "#FFF6E1",
        "#FEF4C0",
        "#FED976",
        "#FEB24C",
        "#FD8D3C",
        "#FC4E2A",
        "#E31A1C",
        "#B10026"  // red
      ]
    };

    /**
     * Converts the string array into a d3 scale.
     *
     * @param {string[]} colors an array of strings representing color
     *     values in hex ("#FFFFFF") or keywords ("white").
     * @param {string} scaleType a string representing the underlying scale
     *     type ("linear"/"log"/"sqrt"/"pow")
     * @returns a Quantitative d3 scale.
     */
    private static getD3InterpolatedScale(colors: string[], scaleType: string): D3.Scale.QuantitativeScale {
      var scale: D3.Scale.QuantitativeScale;
      switch(scaleType){
        case "linear":
          scale = d3.scale.linear();
          break;
        case "log":
          scale = d3.scale.log();
          break;
        case "sqrt":
          scale = d3.scale.sqrt();
          break;
        case "pow":
          scale = d3.scale.pow();
          break;
      }
      if (scale == null){
        throw new Error("unknown Quantitative scale type " + scaleType);
      }
      return scale
                  .range([0, 1])
                  .interpolate(InterpolatedColor.interpolateColors(colors));
    }

    /**
     * Creates a d3 interpolator given the color array.
     *
     * d3 doesn't accept more than 2 range values unless we use a ordinal
     * scale. So, in order to interpolate smoothly between the full color
     * range, we must override the interpolator and compute the color values
     * manually.
     *
     * @param {string[]} colors an array of strings representing color
     *     values in hex ("#FFFFFF") or keywords ("white").
     */
    private static interpolateColors(colors: string[]): D3.Transition.Interpolate {
      if (colors.length < 2) {
        throw new Error("Color scale arrays must have at least two elements.");
      };
      return (ignored: any): any => {
        return (t: any): any => {
          // Clamp t parameter to [0,1]
          t = Math.max(0, Math.min(1, t));

          // Determine indices for colors
          var tScaled = t*(colors.length - 1);
          var i0      = Math.floor(tScaled);
          var i1      = Math.ceil(tScaled);
          var frac    = (tScaled - i0);

          // Interpolate in the L*a*b color space
          return d3.interpolateLab(colors[i0], colors[i1])(frac);
        };
      };
    }

    private _colorRange: string[];
    private _scaleType: string;

    /**
     * Creates a InterpolatedColorScale.
     *
     * @constructor
     * @param {string|string[]} [colorRange] the type of color scale to
     *     create. Default is "reds". @see {@link colorRange} for further
     *     options.
     * @param {string} [scaleType] the type of underlying scale to use
     *     (linear/pow/log/sqrt). Default is "linear". @see {@link scaleType}
     *     for further options.
     */
    constructor(colorRange: any = "reds", scaleType: string = "linear") {
      this._colorRange = this._resolveColorValues(colorRange);
      this._scaleType = scaleType;
      super(InterpolatedColor.getD3InterpolatedScale(this._colorRange, this._scaleType));
    }

    /**
     * Gets the color range.
     *
     * @returns {string[]} the current color values for the range as strings.
     */
    public colorRange(): string[];
    /**
     * Sets the color range.
     *
     * @param {string|string[]} colorRange. If colorRange is one of
     *     (reds/blues/posneg), uses the built-in color groups. If colorRange
     *     is an array of strings with at least 2 values
     *     (e.g. ["#FF00FF", "red", "dodgerblue"], the resulting scale
     *     will interpolate between the color values across the domain.
     * @returns {InterpolatedColor} The calling InterpolatedColor Scale.
     */
    public colorRange(colorRange: any): InterpolatedColor;
    public colorRange(colorRange?: any): any {
      if (colorRange == null) {
        return this._colorRange;
      }
      this._colorRange = this._resolveColorValues(colorRange);
      this._resetScale();
      return this;
    }

    /**
     * Gets the internal scale type.
     *
     * @returns {string} The current scale type.
     */
    public scaleType(): string;
    /**
     * Sets the internal scale type.
     *
     * @param {string} scaleType. The type of d3 scale to use internally.
     *                            (linear/log/sqrt/pow).
     * @returns {InterpolatedColor} The calling InterpolatedColor Scale.
     */
    public scaleType(scaleType: string): InterpolatedColor;
    public scaleType(scaleType?: string): any {
      if (scaleType == null){
        return this._scaleType;
      }
      this._scaleType = scaleType;
      this._resetScale();
      return this;
    }

    private _resetScale(): any {
      this._d3Scale = InterpolatedColor.getD3InterpolatedScale(this._colorRange, this._scaleType);
      this._autoDomainIfAutomaticMode();
      this.broadcaster.broadcast();
    }

    private _resolveColorValues(colorRange: any): string[] {
      if (colorRange instanceof Array) {
        return colorRange;
      } else if (InterpolatedColor.COLOR_SCALES[colorRange] != null) {
        return InterpolatedColor.COLOR_SCALES[colorRange];
      } else {
        return InterpolatedColor.COLOR_SCALES["reds"];
      }
    }

    public autoDomain() {
      // unlike other QuantitativeScales, interpolatedColorScale ignores its domainer
      var extents = this._getAllExtents();
      if (extents.length > 0) {
        this._setDomain([Util.Methods.min(extents, (x) => x[0]), Util.Methods.max(extents, (x) => x[1])]);
      }
      return this;
    }
  }
}
}
