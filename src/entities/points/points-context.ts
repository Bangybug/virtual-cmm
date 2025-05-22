import { Group, Mesh } from "three";
import { Points } from "../../cglib/builders/points";
import { createPoints, updatePoints } from "../../renderables/points";
import { TProject } from "../store/project-store";
import { TNodeKey } from "../types";
import { TPointCollection, TPointKey } from "./types";
import { createSegments, updateSegments } from "../../renderables/segments";

export class PointsContext {
  #points = new Map<TNodeKey, TPointCollection>()
  #mesh?: Mesh

  get data() {
    return this.#points
  }

  setMesh(mesh: Mesh) {
    if (this.#mesh !== mesh) {
      this.#mesh = mesh
      for (const p of this.#points.values()) {
        mesh.parent?.add(p.renderable)
      }
    }
  }

  loadPoints(project: TProject) {
    this.#points.clear()
    if (project.points) {
      for (const [nodeKey, value] of Object.entries(project.points)) {
        const build = new Points({ reserveVertices: 10, componentCount: 3 })
        for (let i = 2; i < value.data.length; i += 3) {
          build.addPoint([value.data[i - 2], value.data[i - 1], value.data[i]])
        }
        this.updatePoints(nodeKey, build)
      }
    }
  }

  onNodeRemoved(key: TNodeKey) {
    const p = this.#points.get(key)
    p?.renderable.removeFromParent()
    this.#points.delete(key)
  }

  updatePoints(key: TNodeKey, points: Points) {
    let p = this.#points.get(key)
    if (!p) {
      const pointsRenderable = createPoints(points)
      const segmentsRenderable = createSegments(points)

      p = {
        points,
        key,
        renderable: new Group().add(pointsRenderable, segmentsRenderable),
        segmentsRenderable,
        pointsRenderable,
        pointKeys: Array.from({ length: points.getUsedCount() }).map((n, i) => i),
        lastPointKey: points.getUsedCount()
      }
      this.#points.set(key, p)
    } else {
      p.points = points
      for (let i = p.pointKeys.length; i < points.getUsedCount(); ++i) {
        p.pointKeys.push(p.lastPointKey++)
      }
      updatePoints(points, p.pointsRenderable)
      updateSegments(points, p.segmentsRenderable)
    }

    if (!p.renderable.parent && this.#mesh) {
      this.#mesh.parent?.add(p.renderable)
    }
  }

  createFor(key: TNodeKey) {
    const points = new Points({ reserveVertices: 32, componentCount: 3 })
    this.updatePoints(key, points)
  }

  removePointByKey(nodeKey: TNodeKey, pointKey: TPointKey): TPointKey | undefined {
    const p = this.#points.get(nodeKey)
    let result = undefined
    if (p) {
      const index = p.pointKeys.indexOf(pointKey)
      if (index !== -1) {
        if (index > 0) {
          result = p.pointKeys[index - 1]
        }
        p.pointKeys.splice(index, 1)
        p.points.splice(index, 1)
        updatePoints(p.points, p.pointsRenderable)
        updateSegments(p.points, p.segmentsRenderable)
      }
    }
    return result
  }

  getPointWithKey(nodeKey: TNodeKey, pointKey: TPointKey): number[] | undefined {
    const p = this.#points.get(nodeKey)
    if (p) {
      const index = p.pointKeys.indexOf(pointKey)
      if (index !== -1) {
        return p.points.getPointAt(index)
      }
    }
  }

  addPoint(nodeKey: TNodeKey, point: number[]) {
    const data = this.#points.get(nodeKey)
    if (data) {
      let shouldAdd = true
      if (data.selectedKey !== undefined) {
        const index = data.pointKeys.indexOf(data.selectedKey)
        if (index !== -1) {
          data.points.insertPoint(index+1, point)
          data.pointKeys.splice(index+1, 0, data.lastPointKey)
          data.selectedKey = data.lastPointKey
          ++data.lastPointKey
          shouldAdd = false
        }
      } 
      
      if (shouldAdd) {
        data.points.addPoint(point)
      }
      this.updatePoints(nodeKey, data.points)
    }
  }
}