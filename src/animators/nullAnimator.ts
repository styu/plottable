///<reference path="../reference.ts" />

module Plottable {
export module Animator {

  /**
   * An animator implementation with no animation. The attributes are
   * immediately set on the selection.
   */
  export class Null implements IPlotAnimator {
    public animate(selection: any, attrToProjector: IAttributeToProjector): D3.Selection {
      return selection.attr(attrToProjector);
    }
  }

}
}
