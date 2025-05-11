import { BufferAttribute, BufferGeometry } from 'three'
import { FaceGraph } from './face-graph'
import { assertBufferAttribute } from '../utils'
import { FacesIterator } from '../iterators/faces-iterator'

export class AdjacencyGraph {
  private index!: BufferAttribute

  private faceGraph!: FaceGraph

  constructor(private geometry: BufferGeometry) {
    this.build(geometry)
  }

  public build(geometry: BufferGeometry) {
    this.geometry = geometry

    const index = this.geometry.getIndex()
    if (!index) {
      throw new Error('Only indexed meshes are supported')
    }
    this.index = index

    const positionAttr = assertBufferAttribute(this.geometry, 'position')

    const startTime = Date.now()

    const facesIterator = new FacesIterator({
      geometry: this.geometry,
      isCalculateNormals: false,
      isFillVertex: false,
    })

    this.faceGraph = new FaceGraph()
    this.faceGraph.build(facesIterator, positionAttr.count, this.index.array)

    console.log('AdjacencyGraph build took', Date.now() - startTime)
  }

  public adjacentIndices(fromVertexIndex: number): Iterable<number> {
    return this.faceGraph.adjacentIndices(fromVertexIndex)
  }

}
