import { RefObject } from 'react'
import { BufferGeometry, Mesh } from 'three'
import { surfaceContextInstance } from '../surface/contexts'

export const getAdjacencyGraph = (model: Mesh | BufferGeometry | undefined) => {
  if (model) {
    const mesh = model as Mesh
    const geometry = model as BufferGeometry
    const resolvedGeometry = mesh.isMesh ? mesh.geometry : geometry

    return surfaceContextInstance.auxiliaries.useAdjacencyGraph(
      resolvedGeometry
    )
  }
  return undefined
}

export const useAdjacencyGraph = (mesh: RefObject<Mesh | undefined>) => {
  return getAdjacencyGraph(mesh.current)
}
