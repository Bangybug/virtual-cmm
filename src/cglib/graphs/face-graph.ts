type TFace = {
  a: number
  b: number
  c: number
}

type TIndexedFace = TFace & { faceIndex: number }

export class FaceGraph {
  private indexPointToFace: number[][] = []

  private index: ArrayLike<number>

  public build(
    facesIterator: Iterable<TFace>,
    vertexCount: number,
    index: ArrayLike<number>
  ) {
    this.index = index

    this.indexPointToFace = Array.from(Array(vertexCount)).map(_ => [])

    let faceIndex = 0

    for (const face of facesIterator) {
      const pointAIndices = (this.indexPointToFace[face.a] =
        this.indexPointToFace[face.a] || [])
      const pointBIndices = (this.indexPointToFace[face.b] =
        this.indexPointToFace[face.b] || [])
      const pointCIndices = (this.indexPointToFace[face.c] =
        this.indexPointToFace[face.c] || [])

      pointAIndices.push(faceIndex)
      pointBIndices.push(faceIndex)
      pointCIndices.push(faceIndex)

      ++faceIndex
    }
  }

  public adjacentIndices(fromVertexIndex: number): Iterable<number> {
    const facesIndex = this.indexPointToFace[fromVertexIndex]

    let face = 0
    let vertex = 0

    const passed: number[] = []

    const index = this.index

    const createIterator = () => ({
      next(): IteratorResult<number> {
        do {
          if (vertex < 3 || face + 1 < facesIndex.length) {
            if (vertex === 3) {
              vertex = 0
              ++face
            }

            const triangleIndex = facesIndex[face] * 3
            const vertexIndex = index[triangleIndex + vertex++]

            if (
              vertexIndex !== fromVertexIndex &&
              !passed.includes(vertexIndex)
            ) {
              passed.push(vertexIndex)
              return { value: vertexIndex, done: false }
            } else {
              continue
            }
          }
          return { value: 0, done: true }
          // eslint-disable-next-line no-constant-condition
        } while (true)
      },
    })

    return {
      [Symbol.iterator]: createIterator,
    }
  }

  public adjacentFaces(fromVertexIndex: number): Iterable<TIndexedFace> {
    const facesIndex = this.indexPointToFace[fromVertexIndex]
    const index = this.index
    let face = 0

    const result: TIndexedFace = {
      a: 0,
      b: 0,
      c: 0,
      faceIndex: 0,
    }

    const createIterator = () => ({
      next(): IteratorResult<TIndexedFace> {
        if (face < facesIndex.length) {
          const vertexIndex = facesIndex[face] * 3

          result.a = index[vertexIndex]
          result.b = index[vertexIndex + 1]
          result.c = index[vertexIndex + 2]
          result.faceIndex = facesIndex[face]

          ++face

          return { value: result, done: false }
        }

        return { value: null, done: true }
      },
    })

    return {
      [Symbol.iterator]: createIterator,
    }
  }

  public getFirstFaceWithVertex(vertexIndex: number) {
    return this.indexPointToFace[vertexIndex][0]
  }
}
