import { Box3, BufferAttribute, BufferGeometry, Sphere, Vector3 } from 'three'
import {
  ExtendedTriangle,
  NOT_INTERSECTED,
  CONTAINED,
  INTERSECTED,
  ShapecastIntersection,
} from 'three-mesh-bvh'
import { AdjacencyGraph } from './graphs/adjacency-graph'
import { assertBufferAttribute } from './utils'
import { getAdjacencyGraph } from '../hooks/use-adjacency-graph'
import { CombinedIterator } from './iterators/combined-iterator'

export class SphereVolumeQuery {
  public readonly results = {
    accumulatedTriangles: new Set<number>(),

    accumulatedIndices: new Set<number>(),

    accumulatedTraversedNodeIndices: new Set<number>(),

    indices: new Set<number>(),

    boundaryIndices: new Set<number>(),

    fullyContainedTriangles: new Set<number>(),

    partiallyContainedTriangles: new Set<number>(),
  }

  public indexAttr!: BufferAttribute

  public positionAttr!: BufferAttribute

  public normalAttr!: BufferAttribute

  private isRestrictedPointsLoaded = false

  private restrictedPoints = new Set<number>()

  private restrictedPointsPromise!: () => Promise<
    Iterable<{ a: number; b: number; c: number }>
  >

  public isValid = false

  private sphere = new Sphere()

  private isFindBoundary = false

  private tempVec = new Vector3()

  private tempConnectedIndices: number[] = []

  private _adjacencyGraph!: AdjacencyGraph

  public clear() {
    this.results.partiallyContainedTriangles.clear()
    this.results.fullyContainedTriangles.clear()
    this.results.indices.clear()
    this.results.boundaryIndices.clear()
  }

  public clearAccumulated() {
    this.results.accumulatedIndices.clear()
    this.results.accumulatedTriangles.clear()
    this.results.accumulatedTraversedNodeIndices.clear()
  }

  public initWithMesh(
    geometry: BufferGeometry,
    restrictedPointsPromise: (
      geometry: BufferGeometry
    ) => Promise<Iterable<{ a: number; b: number; c: number }>>
  ) {
    this.clear()
    this.clearAccumulated()

    this.restrictedPointsPromise = async () => restrictedPointsPromise(geometry)

    this.isValid = false

    if (!geometry.index) {
      throw new Error('Mesh without index is not supported')
    }

    this.indexAttr = geometry.index

    this.positionAttr = assertBufferAttribute(geometry, 'position')

    this.normalAttr = assertBufferAttribute(geometry, 'normal')

    this._adjacencyGraph =
      getAdjacencyGraph(geometry) || new AdjacencyGraph(geometry)

    this.isValid = true
  }

  public get adjacencyGraph() {
    return this._adjacencyGraph
  }

  public setQueryParams(
    sphereCenter: Vector3,
    radius: number,
    isFindBoundary?: boolean
  ) {
    this.sphere.center.copy(sphereCenter)
    this.sphere.radius = radius
    this.isFindBoundary = !!isFindBoundary

    if (!this.isRestrictedPointsLoaded) {
      this.isRestrictedPointsLoaded = true
      this.restrictedPointsPromise().then(triangles => {
        for (const triangle of triangles) {
          this.restrictedPoints.add(triangle.a)
          this.restrictedPoints.add(triangle.b)
          this.restrictedPoints.add(triangle.c)
        }
      })
    }

    this.clear()
  }

  public filterRestrictedPoints() {
    const { indices } = this.results

    const indexToRemove = new Set<number>()
    for (const index of indices) {
      if (this.restrictedPoints.has(index)) {
        indexToRemove.add(index)
      }
    }

    if (indexToRemove.size > 0) {
      for (const index of indexToRemove) {
        indices.delete(index)
      }

      this.filterTriangles(indexToRemove)
    }
  }

  public filterUnconnectedPoints(startingFromIndex: number) {
    const { indices, boundaryIndices } = this.results

    const { tempConnectedIndices, adjacencyGraph } = this

    tempConnectedIndices.length = 0
    if (indices.has(startingFromIndex)) {
      tempConnectedIndices.push(startingFromIndex)
    }
    let pickConnectedIndexAt = tempConnectedIndices.length
    let pickIndex = startingFromIndex

    do {
      const adjacentIndices = adjacencyGraph.adjacentIndices(pickIndex)
      for (const index of adjacentIndices) {
        if (!tempConnectedIndices.includes(index)) {
          if (indices.has(index)) {
            tempConnectedIndices.push(index)
          } else {
            if (this.isFindBoundary) {
              boundaryIndices.add(index)
            }
          }
        }
      }

      if (pickConnectedIndexAt < tempConnectedIndices.length) {
        pickIndex = tempConnectedIndices[pickConnectedIndexAt]
      }
      ++pickConnectedIndexAt
    } while (pickConnectedIndexAt <= tempConnectedIndices.length)

    if (tempConnectedIndices.length < indices.size) {
      indices.clear()
      tempConnectedIndices.forEach(_ => indices.add(_))

      this.filterTriangles()
    }
  }

  private filterTriangles(pointIndexToRemove?: Set<number>) {
    const { indexAttr } = this
    const { indices, fullyContainedTriangles, partiallyContainedTriangles } =
      this.results

    const triIndexToRemove = []

    for (const triIndex of CombinedIterator([
      fullyContainedTriangles,
      partiallyContainedTriangles,
    ])) {
      const i3 = 3 * triIndex
      const a = i3 + 0
      const b = i3 + 1
      const c = i3 + 2
      const va = indexAttr.getX(a)
      const vb = indexAttr.getX(b)
      const vc = indexAttr.getX(c)

      if (pointIndexToRemove) {
        if (
          pointIndexToRemove.has(va) ||
          pointIndexToRemove.has(vb) ||
          pointIndexToRemove.has(vc)
        ) {
          triIndexToRemove.push(triIndex)
        }
      } else {
        if (!indices.has(va) && !indices.has(vb) && !indices.has(vc)) {
          triIndexToRemove.push(triIndex)
        }
      }
    }

    if (triIndexToRemove.length) {
      triIndexToRemove.forEach(_ => {
        const isRemoved = fullyContainedTriangles.delete(_)
        if (!isRemoved) {
          partiallyContainedTriangles.delete(_)
        }
      })
    }
  }

  public accumulateResults() {
    const {
      fullyContainedTriangles,
      partiallyContainedTriangles,
      accumulatedTriangles,
      indices,
      accumulatedIndices,
    } = this.results

    indices.forEach(_ => accumulatedIndices.add(_))
    fullyContainedTriangles.forEach(_ => accumulatedTriangles.add(_))
    partiallyContainedTriangles.forEach(_ => accumulatedTriangles.add(_))
  }

  public isPointRestricted = (pointIndex: number) => {
    return this.restrictedPoints.has(pointIndex)
  }

  public intersectsBounds = (
    box: Box3,
    _isLeaf: boolean,
    _score: number | undefined,
    _depth: number,
    nodeIndex: number
  ): ShapecastIntersection => {
    const { sphere, tempVec } = this
    this.results.accumulatedTraversedNodeIndices.add(nodeIndex)

    const intersects = sphere.intersectsBox(box)
    const { min, max } = box
    if (intersects) {
      for (let x = 0; x <= 1; x++) {
        for (let y = 0; y <= 1; y++) {
          for (let z = 0; z <= 1; z++) {
            tempVec.set(
              x === 0 ? min.x : max.x,
              y === 0 ? min.y : max.y,
              z === 0 ? min.z : max.z
            )
            if (!sphere.containsPoint(tempVec)) {
              return INTERSECTED
            }
          }
        }
      }

      return CONTAINED
    }

    return intersects ? INTERSECTED : NOT_INTERSECTED
  }

  public intersectsTriangle = (
    tri: ExtendedTriangle,
    index: number,
    contained: boolean
  ): boolean => {
    const {
      fullyContainedTriangles,
      partiallyContainedTriangles,
      indices,
      boundaryIndices,
    } = this.results

    const { sphere, indexAttr } = this

    let isFullyContained = contained

    const triIndex = index

    const i3 = 3 * index
    const a = i3 + 0
    const b = i3 + 1
    const c = i3 + 2
    const va = indexAttr.getX(a)
    const vb = indexAttr.getX(b)
    const vc = indexAttr.getX(c)

    if (contained) {
      indices.add(va)
      indices.add(vb)
      indices.add(vc)
    } else {
      const isContainA = sphere.containsPoint(tri.a)
      const isContainB = sphere.containsPoint(tri.b)
      const isContainC = sphere.containsPoint(tri.c)
      isFullyContained = isContainA && isContainB && isContainC

      if (isContainA) {
        indices.add(va)
      } else if (this.isFindBoundary && !isFullyContained) {
        boundaryIndices.add(va)
      }

      if (isContainB) {
        indices.add(vb)
      } else if (this.isFindBoundary && !isFullyContained) {
        boundaryIndices.add(vb)
      }

      if (isContainC) {
        indices.add(vc)
      } else if (this.isFindBoundary && !isFullyContained) {
        boundaryIndices.add(vc)
      }
    }

    if (isFullyContained) {
      fullyContainedTriangles.add(triIndex)
    } else {
      partiallyContainedTriangles.add(triIndex)
    }

    return false
  }
}
