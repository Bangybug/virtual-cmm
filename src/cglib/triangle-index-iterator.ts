import { BufferGeometry, Vector3 } from 'three'

type TFace = {
  a: number
  b: number
  c: number
}

interface ITriangleIndexIteratorProps {
  geometry: BufferGeometry
  triangleIndex?: Iterable<number>
  vertexIndex?: ArrayLike<number>
  count?: number
}

export class TriangleIndexIterator implements Iterable<TFace> {
  private props: ITriangleIndexIteratorProps

  #resultDone: IteratorResult<TFace> = { done: true, value: undefined }
  #resultNext: IteratorResult<TFace> = { done: false, value: {
    a: 0, 
    b: 0,
    c: 0
  } }
  #resultIndexDone: IteratorResult<number> = { done: true, value: undefined }
  #resultIndexNext: IteratorResult<number> = { done: false, value: 0 }

  constructor(props: ITriangleIndexIteratorProps) {
    this.props = props
  }

  public get count() {
    return this.props.count
  }

  [Symbol.iterator](): Iterator<TFace> {
    const indexVector = new Vector3()

    const index = this.props.geometry.getIndex()

    const usedIndex = this.props.vertexIndex || index?.array

    let indexStep = 0
    const triangleCount = (usedIndex?.length || 0) / 3

    const triangleIterator = this.props.triangleIndex?.[Symbol.iterator]() || {
      next: (): IteratorResult<number> => {
        if (indexStep < triangleCount) {
          this.#resultIndexNext.value = indexStep++
          return this.#resultIndexNext
        }
        return this.#resultIndexDone
      },
    }

    return {
      next: (): IteratorResult<TFace> => {
        const entry = triangleIterator.next()
        if (entry.done) {
          return this.#resultDone
        } else {
          const i3 = entry.value * 3

          if (usedIndex) {
            indexVector.fromArray(usedIndex, i3)
          } else {
            indexVector.x = i3
            indexVector.y = i3 + 1
            indexVector.z = i3 + 2
          }

          this.#resultNext.value.a = indexVector.x
          this.#resultNext.value.b = indexVector.y
          this.#resultNext.value.c = indexVector.z

          return this.#resultNext
        }
      },
    }
  }
}
