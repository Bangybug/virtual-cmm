import { Group, Mesh, Plane, Vector3 } from "three";
import { Points } from "../../cglib/builders/points";
import { createPoints, updatePoints } from "../../renderables/points";
import { TProject } from "../store/project-store";
import { TNodeKey } from "../types";
import { TPointCollection, TPointKey } from "./types";
import { createSegments, updateSegments } from "../../renderables/segments";
import { getAdjacencyGraph } from "../../hooks/use-adjacency-graph";
import { calculateAveragePlaneNormal, findClosestPointIndexInFace } from "../../surface/tools/point-select/utils";
import { assertBufferAttribute } from "../../cglib/utils";
import { getClipQuery } from "../../hooks/use-clip-query";

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
          data.points.insertPoint(index + 1, point)
          data.pointKeys.splice(index + 1, 0, data.lastPointKey)
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

  private withGeometry = (pointsKey: TNodeKey) => {
    const from = this.#points.get(pointsKey)
    if (!from) {
      console.warn('Points not defined')
      return
    }
    if (from.points.getUsedCount() < 2) {
      console.warn('Insufficient points')
      return
    }
    const mesh = this.#mesh
    if (!mesh) {
      console.warn('Mesh not set')
      return
    }
    const bvh = mesh.geometry.boundsTree
    if (!bvh) {
      console.warn('Bvh not set')
      return
    }

    const adjGraph = getAdjacencyGraph(mesh)
    const faceGraph = adjGraph.faceGraph

    return { points: from.points, mesh, bvh, faceGraph }
  }

  createCrossSection(withTwoPoints: TNodeKey): Points | undefined {
    const tools = this.withGeometry(withTwoPoints)
    if (!tools) {
      return
    }

    const { points, bvh, mesh, faceGraph } = tools

    const a = points.getPointAsV3At(0, new Vector3())
    const b = points.getPointAsV3At(1, new Vector3())
    const pa = bvh.closestPointToPoint(a)
    const pb = bvh.closestPointToPoint(b)

    if (!pa || !pb) {
      console.warn('Points not available in mesh')
      return
    }

    const twoPoints = [pa, pb]
    const indices = new Set<number>()
    for (const p of twoPoints) {
      const pointIndex = findClosestPointIndexInFace(mesh, p.point, p.faceIndex)
      const faces = faceGraph.adjacentFaces(pointIndex)
      for (const f of faces) {
        indices.add(f.a)
        indices.add(f.b)
        indices.add(f.c)
      }
    }

    const positionAttr = assertBufferAttribute(mesh.geometry, 'position')
    const normalAttr = assertBufferAttribute(mesh.geometry, 'normal')
    const normal = calculateAveragePlaneNormal({
      indices,
      positionAttr,
      normalAttr,
    })

    const dir = a.sub(b)
    const planeNormal = normal.cross(dir).normalize()

    const clipQuery = getClipQuery(mesh)
    clipQuery.setQueryParams(new Plane().setFromNormalAndCoplanarPoint(planeNormal, b))
    bvh.shapecast(clipQuery)

    return clipQuery.result.segments.clone()
  }
}