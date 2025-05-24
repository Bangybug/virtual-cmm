import {
  BufferAttribute,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  LineSegments,
  Object3D,
} from 'three'
import { Points as BuilderPoints } from '../cglib/builders/points'

export const createSegments = (
  from: BuilderPoints,
  color: number = 0x4d4dff,
  isSeparate?: boolean
) => {
  const geometry = new BufferGeometry()
  const pos = new BufferAttribute(from.vertices, 3)
  geometry.setAttribute('position', pos)
  const material = new LineBasicMaterial({
    color,
    depthTest: false,
    depthWrite: false,
  })
  const result = isSeparate ? new LineSegments(geometry, material) : new Line(geometry, material)
  // const result = new LineSegments(geometry, material)
  result.frustumCulled = false
  result.renderOrder = 999
  geometry.setDrawRange(0, from.getUsedCount())

  return result
}

export const updateSegments = (from: BuilderPoints, to: Object3D) => {
  const p = to as Line
  if (p.isLine) {
    const pos = p.geometry.getAttribute('position')
    if (from.vertices.buffer !== pos.array.buffer) {
      p.geometry.setAttribute('position', new BufferAttribute(from.vertices, 3))
    } else {
      pos.needsUpdate = true
    }
    p.geometry.setDrawRange(0, from.getUsedCount())
  }
}