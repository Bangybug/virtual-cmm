import { BufferGeometry, LineBasicMaterial, LineSegments, Vector3 } from 'three'

// to enable normal
// const segments = [new Vector3(), new Vector3(0, 0, 20)]

const segments = []

for (let i = 0; i < 50; i++) {
  const nexti = i + 1
  const x1 = Math.sin((2 * Math.PI * i) / 50)
  const y1 = Math.cos((2 * Math.PI * i) / 50)

  const x2 = Math.sin((2 * Math.PI * nexti) / 50)
  const y2 = Math.cos((2 * Math.PI * nexti) / 50)

  segments.push(new Vector3(x1, y1, 0), new Vector3(x2, y2, 0))
}

const material = new LineBasicMaterial({
  color: 0x000000,
  depthTest: false,
  depthWrite: false,
  transparent: true,
})

const circleGeometry = new BufferGeometry().setFromPoints(segments)

export const circle = new LineSegments(circleGeometry, material)

circle.visible = false
