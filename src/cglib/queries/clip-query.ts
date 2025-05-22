import { Box3, Line3, Plane, Vector3 } from 'three'
import {
  ExtendedTriangle,
  INTERSECTED,
  NOT_INTERSECTED,
  ShapecastIntersection,
} from 'three-mesh-bvh'
import { Points } from '../builders/points'

const tempVector = new Vector3()
const tempVector1 = new Vector3()
const tempVector2 = new Vector3()
const tempVector3 = new Vector3()
const tempVector3Tuple = [0, 0, 0, 0]
const tempLine = new Line3()

export class ClipQuery {
  #query = {
    localPlane: new Plane(),
  }

  #result = {
    segments: new Points({ reserveVertices: 32000, componentCount: 3 }),
  }

  public setQueryParams(localPlane: Plane) {
    this.#query.localPlane.copy(localPlane)
    this.#result.segments.setUsedCount(0)
  }

  public intersectsBounds = (
    box: Box3,
    _isLeaf: boolean,
    _score: number | undefined,
    _depth: number,
    _nodeIndex: number
  ): ShapecastIntersection => {
    return this.#query.localPlane.intersectsBox(box)
      ? INTERSECTED
      : NOT_INTERSECTED
  }

  public intersectsTriangle = (
    tri: ExtendedTriangle,
    _index: number,
    _contained: boolean
  ): boolean => {
    // check each triangle edge to see if it intersects with the plane. If so then
    // add it to the list of segments.
    let count = 0
    const segments = this.#result.segments

    tempLine.start.copy(tri.a)
    tempLine.end.copy(tri.b)
    if (this.#query.localPlane.intersectLine(tempLine, tempVector)) {
      segments.addPoint(tempVector.toArray(tempVector3Tuple))
      count++
    }

    tempLine.start.copy(tri.b)
    tempLine.end.copy(tri.c)
    if (this.#query.localPlane.intersectLine(tempLine, tempVector)) {
      segments.addPoint(tempVector.toArray(tempVector3Tuple))
      count++
    }

    tempLine.start.copy(tri.c)
    tempLine.end.copy(tri.a)
    if (this.#query.localPlane.intersectLine(tempLine, tempVector)) {
      segments.addPoint(tempVector.toArray(tempVector3Tuple))
      count++
    }

    // When the plane passes through a vertex and one of the edges of the triangle, there will be three intersections, two of which must be repeated
    if (count === 3) {
      segments.getPointAsV3At(segments.getUsedCount() - 3, tempVector1)
      segments.getPointAsV3At(segments.getUsedCount() - 2, tempVector1)
      segments.getPointAsV3At(segments.getUsedCount() - 1, tempVector1)
      // If the last point is a duplicate intersection
      if (tempVector3.equals(tempVector1) || tempVector3.equals(tempVector2)) {
        segments.setUsedCount(segments.getUsedCount() - 1)
        count--
      } else if (tempVector1.equals(tempVector2)) {
        // If the last point is not a duplicate intersection
        // Set the penultimate point as a distinct point and delete the last point
        segments.setPointAt(
          segments.getUsedCount() - 2,
          tempVector3.toArray(tempVector3Tuple)
        )
        count--
      }
    }

    // If we only intersected with one or three sides then just remove it. This could be handled
    // more gracefully.
    if (count !== 2) {
      segments.setUsedCount(segments.getUsedCount() - count)
    }

    return false
  }
}
