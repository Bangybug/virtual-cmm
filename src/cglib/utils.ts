import { MeshBVH } from 'three-mesh-bvh'
import { BufferAttribute, BufferGeometry, Vector3 } from 'three'
import { TriangleIndexIterator } from './iterators/triangle-index-iterator'

type TAttributeName = 'position' | 'normal' | 'index' | 'color'

export const assertBufferAttribute = <T = TAttributeName>(
  geometry: BufferGeometry,
  name: T
): BufferAttribute => {
  const attribute = geometry.getAttribute(String(name)) as BufferAttribute
  if (!attribute?.isBufferAttribute) {
    throw new Error(`Expected ${name} BufferAttribute`)
  }

  return attribute
}

export const assertBvh = (geometry: BufferGeometry): MeshBVH => {
  const bvh = geometry.boundsTree as MeshBVH
  if (!bvh?.shapecast) {
    throw new Error('Unexpected bvh not ready')
  }

  return bvh
}

export const setBufferAttribute = (
  target: BufferAttribute,
  source: ArrayLike<number>,
  length?: number
) => {
  const newLength = length === undefined ? source.length : length
  if (target.array.length >= newLength) {
    target.set(source)
  } else {
    target.array = new Float32Array(source)
  }
}

export const setBufferAttributeFromVertices = (
  target: BufferAttribute,
  source: Vector3[],
  length?: number
) => {
  const newLength = length === undefined ? source.length * 3 : length
  if (target.array.length < newLength) {
    target.array = new Float32Array(newLength)
  }
  let index = 0
  for (const v of source) {
    target.setXYZ(index++, v.x, v.y, v.z)
  }
  target.needsUpdate = true
}

export const createPcdFile = (
  geometry: BufferGeometry,
  triangleIndex: TriangleIndexIterator
) => {
  const pointIndex = new Set<number>()
  for (const t of triangleIndex) {
    pointIndex.add(t.a)
    pointIndex.add(t.b)
    pointIndex.add(t.c)
  }

  const header = `VERSION .7\n\
FIELDS x y z\n\
SIZE 4 4 4\n\
TYPE F F F\n\
COUNT 1 1 1\n\
WIDTH ${pointIndex.size}\n\
HEIGHT 1\n\
VIEWPOINT 0 0 0 1 0 0 0\n\
POINTS ${pointIndex.size}\n\
DATA ascii\n`

  const positions = assertBufferAttribute(geometry, 'position')

  let data = ``

  const point = new Vector3()
  for (const index of pointIndex) {
    point.fromBufferAttribute(positions, index)

    data += `${point.x.toPrecision(6)} ${point.y.toPrecision(
      6
    )} ${point.z.toPrecision(6)}\n`
  }

  return header + data
}
