import { Float, Int, INurbsCurve, KnotArray, NurbsCurveData, Point } from "./types";


/**  
 * Construct a NurbsCurve by interpolating a collection of points.  The resultant curve
 * will pass through all of the points. 
 * Note: The points are not verified, and may produce a curve with invalid control points. 
 * For example, consecutive duplicate points.
 */
export const createNurbsCurveByPoints = (points: Array<Point>, degree: Int = 3): INurbsCurve => {
  return (window as any).verb.geom.NurbsCurve.byPoints(points, degree)
}

/** Construct a NurbsCurve by degree, knots, control points, weights */
export const createNurbsCurveByKnotsControlPointsWeights = (degree: Int,
  knots: KnotArray,
  controlPoints: Array<Point>,
  weights: Array<Float> | null = null): INurbsCurve => {
  return (window as any).verb.geom.NurbsCurve.byKnotsControlPointsWeights(knots, controlPoints, weights)
}

export const createNurbsCurve = (data: NurbsCurveData): INurbsCurve => {
  return new (window as any).verb.geom.NurbsCurve(data)
}