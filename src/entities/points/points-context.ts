import { Mesh } from "three";
import { Points } from "../../cglib/builders/points";
import { createPoints, updatePoints } from "../../renderables/points";
import { TProject } from "../store/project-store";
import { TNodeKey } from "../types";
import { TPointCollection } from "./types";

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
      p = {
        points,
        key,
        renderable: createPoints(points),
        pointKeys: Array.from({ length: points.getUsedCount() }).map((n, i) => i),
        lastPointKey: points.getUsedCount()
      }
      this.#points.set(key, p)
    } else {
      p.points = points
      for (let i = p.lastPointKey; i < points.getUsedCount(); ++i) {
        p.pointKeys.push(i)
        ++p.lastPointKey
      }
      updatePoints(points, p.renderable)
    }

    if (!p.renderable.parent && this.#mesh) {
      this.#mesh.parent?.add(p.renderable)
    }
  }

  createFor(key: TNodeKey) {
    const points = new Points({ reserveVertices: 32, componentCount: 3 })
    this.#points.set(key, {
      points,
      key,
      renderable: createPoints(points),
      pointKeys: [],
      lastPointKey: 0,
    })
  }
}