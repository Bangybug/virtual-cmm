import { Line, LineBasicMaterial, LineSegments, Vector3 } from 'three'

import { LineSegmentsBuilder } from '../primitives/lineSegmentsBuilder'

export class SegmentRenderable {
  private builder = new LineSegmentsBuilder({ reserveVertices: 2 })

  public readonly renderable: Line

  constructor(
    material: LineBasicMaterial = new LineBasicMaterial({
      color: 0xffffff,
      depthTest: false,
      depthWrite: false,
    }),
    isSeparateSegments: boolean = false
  ) {
    this.renderable = isSeparateSegments
      ? new LineSegments(this.builder.getLineSegmentsGeometry(), material)
      : new Line(this.builder.getLineSegmentsGeometry(), material)
  }

  clear() {
    this.builder.setUsedCount(0)
    this.builder.needsUpdate()
  }

  dispose() {
    this.builder.dispose()
  }

  addSegment(p1: Vector3, p2: Vector3, color?: number[]) {
    const useColor =
      color || (this.renderable.material as LineBasicMaterial).color.toArray()
    this.builder.addSegment(p1.toArray(), p2.toArray(), useColor, useColor)
    this.builder.needsUpdate()
  }

  setSegment(segmentIndex: number, p1: Vector3, p2: Vector3) {
    const color = (this.renderable.material as LineBasicMaterial).color.toArray()
    this.builder.setSegment(segmentIndex, p1.toArray(), p2.toArray(), color, color)
    this.builder.needsUpdate()
  }
}
