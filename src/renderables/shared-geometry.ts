import {
  BufferGeometry,
  DoubleSide,
  DynamicDrawUsage,
  Mesh,
  MeshBasicMaterial,
  Uint32BufferAttribute,
} from 'three'
import { TriangleIndexIterator } from '../cglib/triangle-index-iterator'

interface ISharedGeometryModelProps {
  isWireframe?: boolean
  color?: number
}

export class SharedGeometryModel {
  private sourceGeometry?: BufferGeometry

  private geometry = new BufferGeometry()

  private indexArray = new Uint32Array()

  public readonly mesh: Mesh

  constructor(props?: ISharedGeometryModelProps) {
    this.mesh = new Mesh(
      this.geometry,
      new MeshBasicMaterial({
        side: DoubleSide,
        color: props?.color || 0x2886de,
        opacity: 0.5,
        wireframe: props?.isWireframe,
        polygonOffset: !props?.isWireframe,
        polygonOffsetFactor: -20,
        transparent: !props?.isWireframe,
        depthWrite: false,
        depthTest: true,
      })
    )
  }

  public setSourceGeometry(sourceGeometry: BufferGeometry) {
    const { geometry } = this

    this.mesh.frustumCulled = false

    if (this.sourceGeometry !== sourceGeometry) {
      this.sourceGeometry = sourceGeometry

      geometry.setAttribute('position', sourceGeometry.getAttribute('position'))
    }
  }

  public updateIndex(triangles: TriangleIndexIterator) {
    if (triangles.count === undefined) {
      throw new Error('Expected triangle count')
    }

    const indexCount = triangles.count * 3
    if (this.indexArray.length < indexCount) {
      this.indexArray = new Uint32Array(indexCount)
      const bufferAttribute = new Uint32BufferAttribute(this.indexArray, 1)
      bufferAttribute.setUsage(DynamicDrawUsage)
      this.geometry.setIndex(bufferAttribute)
    }

    const { indexArray, geometry } = this

    let index = 0
    for (const triangle of triangles) {
      if (index === indexCount) {
        break
      }

      indexArray[index++] = triangle.a
      indexArray[index++] = triangle.b
      indexArray[index++] = triangle.c
    }

    const indexAttr = geometry.getIndex()

    if (indexAttr) {
      indexAttr.set(indexArray.slice(0, index))
      indexAttr.needsUpdate = true
    }

    geometry.setDrawRange(0, index)
  }

  public dispose() {
    if (this.geometry) {
      this.removeSharedAttributes()
      this.geometry.dispose()
    }
  }

  private removeSharedAttributes() {
    if (this.geometry.hasAttribute('position')) {
      this.geometry.deleteAttribute('position')
    }
  }
}
