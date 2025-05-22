import { Box3, Line3, Plane, Vector3 } from "three"
import { ExtendedTriangle, INTERSECTED, NOT_INTERSECTED, ShapecastIntersection } from "three-mesh-bvh"
import { Points } from "../builders/points";


const tempVector = new Vector3();
const tempVector1 = new Vector3();
const tempVector2 = new Vector3();
const tempVector3 = new Vector3();
const tempLine = new Line3();
let index = 0

export class ClipQuery {

  #query = {
    localPlane: new Plane()
  }

  #result = {
    segments: new Points({reserveVertices: 32000, componentCount: 3})
  }

  public setQueryParams(localPlane: Plane) {
    this.#query.localPlane.copy(localPlane)
    this.#result.segments.setUsedCount(0)
    index = 0
  }

  public intersectsBounds = (
    box: Box3,
    _isLeaf: boolean,
    _score: number | undefined,
    _depth: number,
    _nodeIndex: number
  ): ShapecastIntersection => {
    return this.#query.localPlane.intersectsBox(box) ? INTERSECTED : NOT_INTERSECTED
  }

  public intersectsTriangle = (
    tri: ExtendedTriangle,
    _index: number,
    _contained: boolean
  ): boolean => {
    // check each triangle edge to see if it intersects with the plane. If so then
    // add it to the list of segments.
    let count = 0;

    tempLine.start.copy(tri.a);
    tempLine.end.copy(tri.b);
    if (this.#query.localPlane.intersectLine(tempLine, tempVector)) {
      posAttr.setXYZ(index, tempVector.x, tempVector.y, tempVector.z);
      index++;
      count++;
    }

    tempLine.start.copy(tri.b);
    tempLine.end.copy(tri.c);
    if (this.#query.localPlane.intersectLine(tempLine, tempVector)) {
      posAttr.setXYZ(index, tempVector.x, tempVector.y, tempVector.z);
      count++;
      index++;
    }

    tempLine.start.copy(tri.c);
    tempLine.end.copy(tri.a);
    if (this.#query.localPlane.intersectLine(tempLine, tempVector)) {
      posAttr.setXYZ(index, tempVector.x, tempVector.y, tempVector.z);
      count++;
      index++;
    }

    // When the plane passes through a vertex and one of the edges of the triangle, there will be three intersections, two of which must be repeated
    if (count === 3) {
      tempVector1.fromBufferAttribute(posAttr, index - 3);
      tempVector2.fromBufferAttribute(posAttr, index - 2);
      tempVector3.fromBufferAttribute(posAttr, index - 1);
      // If the last point is a duplicate intersection
      if (tempVector3.equals(tempVector1) || tempVector3.equals(tempVector2)) {
        count--;
        index--;
      } else if (tempVector1.equals(tempVector2)) {
        // If the last point is not a duplicate intersection
        // Set the penultimate point as a distinct point and delete the last point
        posAttr.setXYZ(index - 2, tempVector3);
        count--;
        index--;
      }
    }

    // If we only intersected with one or three sides then just remove it. This could be handled
    // more gracefully.
    if (count !== 2) {
      index -= count;
    }

    return false
  }
}