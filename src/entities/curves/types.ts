import { Object3D } from 'three'
import { TNodeKey } from '../types'

export type TNurbsCurve = {
  key: TNodeKey
  pointsNode: TNodeKey
  renderable: Object3D
  curve: INurbsCurve
}

export type Float = number
export type Int = number
export type Vector = ArrayLike<Float>
export type Point = ArrayLike<Float>

/** 
 * A `KnotArray` is a non-decreasing sequence of floating point . Use the methods in `Check` to validate `KnotArray`'s
 */
export type KnotArray = Array<Float>;

export type Interval<T> = {
  min: T
  max: T
}

export type CurveLengthSample = {
  u: Float;
  len: Float;
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
  ) { }
}

export interface INurbsCurve extends ICurve {
  //The degree of the curve
  degree(): Int

  //The knot array
  knots(): KnotArray

  //Array of control points
  controlPoints(): Array<Point>

  //Array of weight values
  weights(): Array<Float>

  asNurbs(): NurbsCurveData

  clone(): INurbsCurve

  /**
   * Obtain the curve tangent at the given parameter.  This is the first derivative and is
   * not normalized
   */
  tangent(u: Float): Vector

  derivativesAsync(u: Float, numDerivs: Int): Promise<Array<Vector>>

  /**
   * Determine the closest point on the curve to the given point
   * @param pt 
   */
  closestPoint(pt: Point): Point

  closestPointAsync(pt: Point): Promise<Point>

  /**
   * Determine the closest parameter on the curve to the given point
   * @param pt 
   */
  closestParam(pt: Point): Float

  closestParamAsync(pt: Point): Promise<Point>

  /** Determine the arc length of the curve */
  length(): Float

  lengthAsync(): Promise<Float>

  /** Determine the arc length of the curve at the given parameter */
  lengthAtParam(u: Float): Float

  lengthAtParamAsync(): Promise<Float>

  /** Determine the parameter of the curve at the given arc length */
  paramAtLength(len: Float, tolerance: Float | null): Float

  paramAtLengthAsync(len: Float, tolerance: Float | null): Promise<Float>

  /** Determine the parameters necessary to divide the curve into equal arc length segments */
  divideByEqualArcLength(divisions: Int): Array<CurveLengthSample>

  divideByEqualArcLengthAsync(divisions: Int): Promise<Array<CurveLengthSample>>

  /** Given the distance to divide the curve, determine the parameters necessary to divide the curve into equal arc length segments */
  divideByArcLength(arcLength: Float): Array<CurveLengthSample>

  divideByArcLengthAsync(divisions: Int): Promise<Array<CurveLengthSample>>

  /** Split the curve at the given parameter
   * @returns Two curves - one at the lower end of the parameter range and one at the higher end.
   */
  split(u: Float): Array<INurbsCurve>

  splitAsync(u: Float): Promise<Array<INurbsCurve>>

  /** Reverse the parameterization of the curve */
  reverse(): INurbsCurve

  reverseAsync(): Promise<INurbsCurve>

  tessellate(tolerance: Float | null): Array<Point>

  tessellateAsync(tolerance: Float | null): Promise<Array<Point>>
}
