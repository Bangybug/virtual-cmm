import { BufferAttribute, BufferGeometry, Object3D, Points, PointsMaterial } from "three";
import { Points as BuilderPoints } from "../cglib/builders/points";

export const createPoints = (from: BuilderPoints): Points => {
  const geometry = new BufferGeometry()
  const pos = new BufferAttribute(from.vertices, 3)
  geometry.setAttribute('position', pos)
  const material = new PointsMaterial({
    size: 15,
    sizeAttenuation: true,
    // alphaTest: 0.5,
    vertexColors: false,
    depthTest: false,
    color: 0x222222
  })
  const result = new Points(geometry, material)
  result.frustumCulled = false
  result.renderOrder = 999

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