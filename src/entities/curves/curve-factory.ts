import {
  Float,
  Int,
  INurbsCurve,
  KnotArray,
  Point,
  TNurbsCurveData,
} from './types'

import * as verb from 'verb-nurbs'

/**
 * Construct a NurbsCurve by interpolating a collection of points.  The resultant curve
 * will pass through all of the points.
 * Note: The points are not verified, and may produce a curve with invalid control points.
 * For example, consecutive duplicate points.
 */
export const createNurbsCurveByPoints = (
  points: Array<Point>,
  degree: Int = 3
): INurbsCurve => {
  return verb.default.geom.NurbsCurve.byPoints(points, degree)
  // return (window as any).verb.geom.NurbsCurve.byPoints(points, degree)
}

/** Construct a NurbsCurve by degree, knots, control points, weights */
export const createNurbsCurveByKnotsControlPointsWeights = (
  degree: Int,
  knots: KnotArray,
  controlPoints: Array<Point>,
  weights: Array<Float> | null = null
): INurbsCurve => {
  return verb.default.geom.NurbsCurve.byKnotsControlPointsWeights(
    degree,
    knots,
    controlPoints,
    weights
  )
  // return (window as any).verb.geom.NurbsCurve.byKnotsControlPointsWeights(
  //   degree,
  //   knots,
  //   controlPoints,
  //   weights
  // )
}

export const createNurbsCurve = (data: TNurbsCurveData): INurbsCurve => {
  return new verb.default.geom.NurbsCurve(data)
  // return new (window as any).verb.geom.NurbsCurve(data)
}
