import { BufferAttribute, BufferGeometry } from 'three'
import { HalfEdgeGraph } from './HalfEdgeGraph'
import { FaceGraph } from './FaceGraph'
import { FacesIterator } from '../FacesIterator'
import { assertBufferAttribute } from '../../EditableSurface/utils'

export class AdjacencyGraph {
  private index: BufferAttribute

  private faceGraph: FaceGraph

  private halfEdgeGraph: HalfEdgeGraph

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

    this.halfEdgeGraph = new HalfEdgeGraph()
    this.halfEdgeGraph.build(facesIterator, this.faceGraph)

    console.log('AdjacencyGraph build took', Date.now() - startTime)
  }

  public adjacentIndices(fromVertexIndex: number): Iterable<number> {
    return this.faceGraph.adjacentIndices(fromVertexIndex)
  }

  public boundaryIndices() {
    return this.halfEdgeGraph.boundaryIndices
  }
}
