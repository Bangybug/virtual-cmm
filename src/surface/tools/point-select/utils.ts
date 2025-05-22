import { BufferAttribute, Mesh, Object3D, Vector3, Vector3Like } from "three"
import { assertBufferAttribute } from "../../../cglib/utils"
import { getAdjacencyGraph } from "../../../hooks/use-adjacency-graph"
import { FacesIterator } from "../../../cglib/iterators/faces-iterator"

const Z = new Vector3(0, 0, 1)

const tmp = {
  indices: new Set<number>(),
  localPoint: new Vector3(),
  normal: new Vector3(),
  p: new Vector3(),
}

export const calculateAveragePlaneNormal = (params: {
  indices: Set<number>
  positionAttr: BufferAttribute
  normalAttr: BufferAttribute
}) => {
  const normal = tmp.normal.set(0, 0, 0)
  const tempVec = tmp.p

  params.indices.forEach(index => {
    tempVec.fromBufferAttribute(params.normalAttr, index)
    normal.add(tempVec)
  })
  normal.normalize()
  
  return normal
}

type TCursorPosition = {
  cursor: Object3D
  mesh: Mesh
  point: Vector3
  faceIndex: number
}

export const findClosestPointIndexInFace = (mesh: Mesh, point: Vector3Like, faceIndex: number) => {
  let d = Number.POSITIVE_INFINITY
  let di = 0
  let pointIndex = 0
  const f = new FacesIterator({
    isCalculateNormals: false,
    isFillVertex: true,
    triangleIndex: [faceIndex],
    geometry: mesh.geometry
  })
  for (const fi of f) {
    di = tmp.p.copy(fi.triangle.a).applyMatrix4(mesh.matrix).distanceToSquared(point)
    if (di < d) {
      pointIndex = fi.a
      d = di
    }
    di = tmp.p.copy(fi.triangle.b).applyMatrix4(mesh.matrix).distanceToSquared(point)
    if (di < d) {
      pointIndex = fi.b
      d = di
    }
    di = tmp.p.copy(fi.triangle.c).applyMatrix4(mesh.matrix).distanceToSquared(point)
    if (di < d) {
      pointIndex = fi.c
      d = di
    }
  }

  return pointIndex
}

export const setCursorToPoint = ({
  mesh,
  point,
  cursor,
  faceIndex,
}: TCursorPosition) => {
  const bvh = mesh.geometry.boundsTree
  if (!bvh) {
    return
  }

  const pointIndex = findClosestPointIndexInFace(mesh, point, faceIndex)
  const adjGraph = getAdjacencyGraph(mesh)!
  const faceGraph = adjGraph.faceGraph

  const faces = faceGraph.adjacentFaces(pointIndex)
  tmp.indices.clear()
  for (const f of faces) {
    tmp.indices.add(f.a)
    tmp.indices.add(f.b)
    tmp.indices.add(f.c)
  }

  const positionAttr = assertBufferAttribute(mesh.geometry, 'position')
  const normalAttr = assertBufferAttribute(mesh.geometry, 'normal')
  tmp.localPoint.fromBufferAttribute(positionAttr, pointIndex)
  const normal = calculateAveragePlaneNormal({
    indices: tmp.indices,
    positionAttr,
    normalAttr
  })

  cursor.position.copy(tmp.localPoint)
  cursor.quaternion.setFromUnitVectors(Z, normal)

  return [tmp.localPoint, normal]
}
