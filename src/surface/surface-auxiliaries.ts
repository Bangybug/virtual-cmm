import { BufferGeometry } from "three"
import { AdjacencyGraph } from "../cglib/graphs/adjacency-graph"
import { SphereVolumeQuery } from "../cglib/queries/sphere-volume-query"
import { SurfaceContext } from "./surface-context"

type TAuxiliary = {
  adjacencyGraph?: AdjacencyGraph
  sphereVolumeQuery?: SphereVolumeQuery
}

export class SurfaceAuxiliaries {
  private auxiliaries = new Map<string, TAuxiliary>()

  constructor(surfaceContext: SurfaceContext) {
    surfaceContext.addEventListener('unregisterSurface', (s) => {
      this.auxiliaries.delete(s.surface.mesh?.geometry.uuid)
    })
  }

  public clear() {
    this.auxiliaries.clear()
  }

  private useAux(uuid: string) {
    let aux = this.auxiliaries.get(uuid)

    if (!aux) {
      aux = {}
      this.auxiliaries.set(uuid, aux)
    }

    return aux
  }

  public useAdjacencyGraph(geometry: BufferGeometry) {
    const aux = this.useAux(geometry.uuid)

    if (!aux.adjacencyGraph) {
      aux.adjacencyGraph = new AdjacencyGraph(geometry)
    }

    return aux.adjacencyGraph
  }

  public useSphereVolumeQuery(geometry: BufferGeometry) {
    const aux = this.useAux(geometry.uuid)

    if (!aux.sphereVolumeQuery) {
      aux.sphereVolumeQuery = new SphereVolumeQuery()
      aux.sphereVolumeQuery.initWithMesh(
        geometry,
        async () => []
      )
    }

    return aux.sphereVolumeQuery
  }
}