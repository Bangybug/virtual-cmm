import {
  BufferAttribute,
  BufferGeometry,
  Object3D,
  Points,
  PointsMaterial,
  TextureLoader,
} from 'three'
import { Points as BuilderPoints } from '../cglib/builders/points'

const texture = new TextureLoader().load('disc.png')

export const createPoints = (
  from: BuilderPoints,
  color: number = 0x4d4dff
): Points => {
  const geometry = new BufferGeometry()
  const pos = new BufferAttribute(from.vertices, 3)
  geometry.setAttribute('position', pos)
  const material = new PointsMaterial({
    size: 10,
    sizeAttenuation: true,
    map: texture,
    transparent: true,
    // alphaTest: 0.5,
    vertexColors: false,
    depthTest: false,
    opacity: 0.7,
    color,
  })
  const result = new Points(geometry, material)
  result.frustumCulled = false
  result.renderOrder = 999
  geometry.setDrawRange(0, from.getUsedCount())

  return result
}

export const updatePoints = (from: BuilderPoints, to: Object3D) => {
  const p = to as Points
  if (p.isPoints) {
    const pos = p.geometry.getAttribute('position')
    if (from.vertices.buffer !== pos.array.buffer) {
      p.geometry.setAttribute('position', new BufferAttribute(from.vertices, 3))
    } else {
      pos.needsUpdate = true
    }
    p.geometry.setDrawRange(0, from.getUsedCount())
  }
}
