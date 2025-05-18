import { TypedArray } from 'three'

type TPointsProps = {
  reserveVertices: number
  componentCount: number
  init?: Iterator<number[]>
  arrayFactory?: (count: number) => TypedArray
}

export class Points {
  constructor(props: TPointsProps) {
    this.props = { ...props }

    if (props.arrayFactory) {
      this.arrayFactory = props.arrayFactory
    }

    this.verticesArray = this.arrayFactory(
      props.reserveVertices * props.componentCount
    )
    this.tmpGetPointTarget = Array<number>(props.componentCount)

    if (props.init) {
      let next
      do {
        next = props.init.next()
        if (!next.done) {
          this.addPoint(next.value)
        }
      } while (!next.done)
    }
  }

  readonly props: TPointsProps

  private arrayFactory = (count: number): TypedArray => new Float32Array(count)

  private tmpGetPointTarget = Array<number>()

  private verticesArray: TypedArray

  private usedCount = 0

  get vertices() {
    return this.verticesArray
  }

  get view() {
    return this.verticesArray.subarray(
      0,
      this.usedCount * this.props.componentCount
    )
  }

  reserve(count: number) {
    const { verticesArray, props, usedCount } = this
    const newLength = count * props.componentCount

    if (verticesArray.length < newLength) {
      props.reserveVertices = count

      const newArray = this.arrayFactory(newLength)
      if (usedCount > 0) {
        newArray.set(verticesArray.slice(0, usedCount * props.componentCount))
      }

      this.verticesArray = newArray
    }
  }

  setUsedCount(usedCount?: number) {
    this.usedCount = Math.max(
      0,
      Math.min(usedCount || 0, this.props.reserveVertices)
    )
  }

  getUsedCount() {
    return this.usedCount
  }

  dispose() {
    if (this.props.reserveVertices > 0) {
      this.verticesArray = this.arrayFactory(0)
      this.props.reserveVertices = 0
      this.usedCount = 0
    }
  }

  swap(index1: number, index2: number) {
    const { componentCount } = this.props
    const offset1 = index1 * componentCount
    const offset2 = index2 * componentCount

    for (let i = 0; i < componentCount; ++i) {
      const tmp = this.verticesArray[offset1 + i]
      this.verticesArray[offset1 + i] = this.verticesArray[offset2 + i]
      this.verticesArray[offset2 + i] = tmp
    }
  }

  setPointAt(index: number, point: ArrayLike<number>) {
    const { reserveVertices, componentCount } = this.props

    if (index >= reserveVertices) {
      this.reserve(reserveVertices * 2)
    }

    const offset = index * componentCount
    for (let i = 0; i < componentCount; ++i) {
      this.verticesArray[offset + i] = point[i]
    }

    this.usedCount = Math.max(index + 1, this.usedCount)
  }

  addPoints(points: Float32Array) {
    const { reserveVertices, componentCount } = this.props
    const countToAdd = Math.floor(points.length / componentCount)

    if (this.usedCount + countToAdd > reserveVertices) {
      this.reserve(this.usedCount + countToAdd)
    }

    const firstElement = this.usedCount * componentCount
    this.verticesArray.set(points, firstElement)

    this.usedCount += countToAdd
  }

  addPoint(point: ArrayLike<number>) {
    this.setPointAt(this.usedCount, point)
  }

  getPointAt(index: number, target?: Array<number>): Array<number> {
    const ret = target || this.tmpGetPointTarget
    const { componentCount } = this.props

    const offset = index * componentCount
    for (let i = 0; i < componentCount; ++i) {
      ret[i] = this.verticesArray[offset + i]
    }

    return ret
  }

  initWith(array: TypedArray, usedCount: number) {
    this.usedCount = usedCount
    this.verticesArray = array
    this.props.reserveVertices = Math.floor(
      array.length / this.props.componentCount
    )
    if (usedCount >= this.props.reserveVertices) {
      this.reserve(usedCount)
    }
  }

  map<Z>(fn: (element: number[], index: number) => Z): Z[] {
    const newArr: Z[] = []
    const end = this.getUsedCount()
    for (let i = 0; i < end; ++i) {
      newArr.push(fn(this.getPointAt(i), i))
    }
    return newArr
  }

  splice(index: number, deleteCount: number) {
    this.verticesArray.copyWithin(
      index * this.props.componentCount, 
      (index + deleteCount) * this.props.componentCount)
    this.usedCount -= deleteCount
  }
}
