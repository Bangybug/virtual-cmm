import { Points } from '../../cglib/builders/points'

export type TNurbsCurve = {
  source: Points
}

type Float = number
type Int = number
type Vector = ArrayLike<Float>
type Point = ArrayLike<Float>

type Interval<T> = {
  min: T
  max: T
}

export interface ICurve {
  /**
   * Provide the NURBS representation of the curve
   * @returns NurbsCurveData object representing the curve
   */
  asNurbs(): NurbsCurveData

  /**
   * Obtain the parametric domain of the curve
   * @returns An Interval object containing the min and max of the domain
   */
  domain(): Interval<Float>

  /**
   * Evaluate a point on the curve
   * @param u The parameter on the curve
   * @returns The evaluated point
   */
  point(u: Float): Point

  /**
   * Evaluate the derivatives at a point on a curve
   * @param u The parameter on the curve
   * @param numDerivs The number of derivatives to evaluate on the curve
   * @returns An array of derivative vectors
   */
  derivatives(u: Float, numDerivs: Int): ArrayLike<Vector>
}

export class NurbsCurveData {
  constructor(
    /** integer degree of curve */
    public degree: Int,
    /** array of nondecreasing knot values */
    public knots: Array<Float>,
    /** 2d array of control points, where each control point is an array of length (dim) */
    public controlPoints: Array<Point>
  ) {}
}

export interface INurbsCurve {}
