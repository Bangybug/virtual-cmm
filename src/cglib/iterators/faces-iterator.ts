import { BufferGeometry, GLBufferAttribute, Triangle, Vector3 } from 'three'

interface IFacesIteratorProps {
  isCalculateNormals?: boolean
  isFillVertex?: boolean
  triangleIndex?: Iterable<number>
  geometry: BufferGeometry
}

interface IFace {
  a: number
  b: number
  c: number
  triangle: Triangle
  normal: Vector3
}

export class FacesIterator implements Iterable<IFace> {
  private props: IFacesIteratorProps

  #resultDone: IteratorResult<IFace> = { value: undefined, done: true }

  constructor(props: IFacesIteratorProps) {
    this.props = props
  }

  [Symbol.iterator](): Iterator<IFace> {
    let indexStep = 0

    const indexVector = new Vector3()
    const position = this.props.geometry.getAttribute('position')
    const index = this.props.geometry.getIndex()
    const indexCount = index ? index.count : position.count

    const {
      isCalculateNormals = true,
      isFillVertex,
      triangleIndex,
    } = this.props

    const triangleIterator = triangleIndex?.[Symbol.iterator]()

    if (position instanceof GLBufferAttribute) {
      throw new Error('GLBufferAttribute not supported')
    }

    const resultDone = this.#resultDone
    const resultFace: IteratorResult<IFace> = { value: {a: 0, b: 0, c: 0, triangle: new Triangle(), normal: new Vector3()}, done: false}
    const face = resultFace.value
    const triangle = face.triangle
    const normal = face.normal
    
    return {
      next(): IteratorResult<IFace> {
        if (triangleIterator) {
          const entry = triangleIterator.next()
          if (entry.done) {
            return resultDone
          } else {
            indexStep = entry.value * 3
          }
        } else {
          if (indexStep >= indexCount) {
            return resultDone
          }
        }

        if (index) {
          indexVector.fromArray(index.array, indexStep)
          indexStep += 3
        } else {
          indexVector.x = indexStep++
          indexVector.y = indexStep++
          indexVector.z = indexStep++
        }

        if (isCalculateNormals || isFillVertex) {
          triangle.setFromAttributeAndIndices(
            position,
            indexVector.x,
            indexVector.y,
            indexVector.z
          )

          if (isCalculateNormals) {
            triangle.getNormal(normal)
          }
        }

        face.a = indexVector.x
        face.b = indexVector.y
        face.c = indexVector.z

        return resultFace
      },
    }
  }
}
