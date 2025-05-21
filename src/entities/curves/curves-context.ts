import { Group, Mesh } from 'three'
import { TNodeKey } from '../types'
import { TNurbsCurve } from './types'
import { TPointCollection } from '../points/types'
import { createNurbsCurveByPoints } from './curve-factory'
import { createPoints, updatePoints } from '../../renderables/points'
import { Points } from '../../cglib/builders/points'

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

  updateCurve(curveNodeKey: TNodeKey, p: TPointCollection) {
    let c = this.#curves.get(curveNodeKey)

    const points = p.points.map((p) => [...p])
    // TODO allow changing of control points
    const curve = createNurbsCurveByPoints(points, 3)

    const controlPointsBuilder = c?.controlPointsBuilder || new Points({
        reserveVertices: curve.controlPoints.length,
        componentCount: 3,
      })
    controlPointsBuilder.setUsedCount(0)
    controlPointsBuilder.reserve(curve.controlPoints.length)
    for (const cp of curve.controlPoints()) {
      controlPointsBuilder.addPoint(cp)
    }
    
    const controlPoints = c?.controlPoints || createPoints(p.points, 0xdd0000)
    

    if (!c) {
      c = {
        key: curveNodeKey,
        pointsNode: p.key,
        curve,
        controlPoints,
        controlPointsBuilder,
        renderable: new Group().add(controlPoints),
      } satisfies TNurbsCurve
      this.#curves.set(curveNodeKey, c)
    } else {
      c.curve = curve
      updatePoints(p.points, c.controlPoints)
    }

    if (!c.renderable.parent && this.#mesh) {
      this.#mesh.parent?.add(c.renderable)
    }
  }
}
