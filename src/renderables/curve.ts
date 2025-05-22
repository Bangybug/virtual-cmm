import {
  BufferAttribute,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Object3D,
} from 'three'
import { Points as BuilderPoints } from '../cglib/builders/points'
import { INurbsCurve } from '../entities/curves/types'

export const TESSELATION_SCALE = 1000

export const tessellateCurve = (
  curve: INurbsCurve,
  builder: BuilderPoints,
  color: number = 0x4d4dff
) => {
  const geometry = new BufferGeometry()

  const points = curve.tessellate(null)
  builder.setUsedCount(0)
  builder.reserve(points.length)
  points.forEach((p) => builder.addPoint(p.map(i => i/TESSELATION_SCALE)))

  const pos = new BufferAttribute(builder.vertices, 3)
  geometry.setAttribute('position', pos)
  const material = new LineBasicMaterial({
    color,
    depthTest: false,
    depthWrite: false,
  })
  const result = new Line(geometry, material)
  result.frustumCulled = false
  result.renderOrder = 999
  geometry.setDrawRange(0, builder.getUsedCount())

  return result
}

export const updateTessellatedCurve = (
  curve: INurbsCurve,
  builder: BuilderPoints,
  to: Object3D
) => {
  const p = to as Line
  if (p.isLine) {
    const points = curve.tessellate(null)
    builder.setUsedCount(0)
    builder.reserve(points.length)
    points.forEach((p) => builder.addPoint(p.map(i => i/TESSELATION_SCALE)))

    const pos = p.geometry.getAttribute('position')
    if (builder.vertices.buffer !== pos.array.buffer) {
      p.geometry.setAttribute(
        'position',
        new BufferAttribute(builder.vertices, 3)
      )
    } else {
      pos.needsUpdate = true
    }
    p.geometry.setDrawRange(0, builder.getUsedCount())
  }
}
