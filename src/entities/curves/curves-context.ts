import { Group, Mesh } from 'three'
import { TNodeKey } from '../types'
import { INurbsCurve, TNurbsCurve } from './types'
import { TPointCollection } from '../points/types'
import {
  createNurbsCurve,
  createNurbsCurveByKnotsControlPointsWeights,
  createNurbsCurveByPoints,
} from './curve-factory'
import { createPoints, updatePoints } from '../../renderables/points'
import { Points } from '../../cglib/builders/points'
import { createSegments, updateSegments } from '../../renderables/segments'
import { TProject } from '../store/project-store'

export class CurvesContext {
  #curves = new Map<TNodeKey, TNurbsCurve>()
  #mesh?: Mesh

  get data() {
    return this.#curves
  }

  setMesh(mesh: Mesh) {
    if (this.#mesh !== mesh) {
      this.#mesh = mesh
      for (const p of this.#curves.values()) {
        mesh.parent?.add(p.renderable)
      }
    }
  }

  onNodeRemoved(key: TNodeKey) {
    const p = this.#curves.get(key)
    p?.renderable.removeFromParent()
    this.#curves.delete(key)
  }

  getCurveNodeKey(pointsNodeKey: TNodeKey) {
    for (const c of this.#curves.values()) {
      if (c.pointsNode === pointsNodeKey) {
        return c.key
      }
    }
  }

  loadCurves(project: TProject) {
    this.#curves.clear()
    if (project.curves) {
      for (const [nodeKey, value] of Object.entries(project.curves)) {
        const curve = createNurbsCurveByKnotsControlPointsWeights(
          value.degree,
          value.knots,
          value.controlPoints,
          value.weights
        )
        this.updateCurveInternal(nodeKey, value.pointsNode, curve)
      }
    }
  }

  updateCurveFromPoints(curveNodeKey: TNodeKey, p: TPointCollection) {
    const points = p.points.map((p) => [...p])
    const curve = createNurbsCurveByPoints(points, 3)
    this.updateCurveInternal(curveNodeKey, p.key, curve)
  }

  private updateCurveInternal = (
    curveNodeKey: TNodeKey,
    pointsNodeKey: TNodeKey,
    curve: INurbsCurve
  ) => {
    let c = this.#curves.get(curveNodeKey)
    const controlPointsBuilder =
      c?.controlPointsBuilder ||
      new Points({
        reserveVertices: curve.controlPoints.length,
        componentCount: 3,
      })
    const curveControlPoints = curve.controlPoints()
    controlPointsBuilder.setUsedCount(0)
    controlPointsBuilder.reserve(curveControlPoints.length)
    for (const cp of curveControlPoints) {
      controlPointsBuilder.addPoint(cp)
    }

    const controlPoints =
      c?.controlPoints || createPoints(controlPointsBuilder, 0xdd0000)
    const controlSegments =
      c?.controlSegments || createSegments(controlPointsBuilder, 0xbb0000)

    if (!c) {
      c = {
        key: curveNodeKey,
        pointsNode: pointsNodeKey,
        curve,
        controlPoints,
        controlPointsBuilder,
        controlSegments,
        renderable: new Group().add(controlPoints, controlSegments),
      } satisfies TNurbsCurve
      this.#curves.set(curveNodeKey, c)
    } else {
      c.curve = curve
      updatePoints(controlPointsBuilder, c.controlPoints)
      updateSegments(controlPointsBuilder, c.controlSegments)
    }

    if (!c.renderable.parent && this.#mesh) {
      this.#mesh.parent?.add(c.renderable)
    }
  }
}
