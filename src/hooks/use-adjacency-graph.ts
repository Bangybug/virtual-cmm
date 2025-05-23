import { RefObject } from 'react'
import { BufferGeometry, Mesh } from 'three'
import { surfaceContextInstance } from '../contexts'

export const getAdjacencyGraph = (model: Mesh | BufferGeometry) => {
  const mesh = model as Mesh
  const geometry = model as BufferGeometry
  const resolvedGeometry = mesh.isMesh ? mesh.geometry : geometry

  return surfaceContextInstance.auxiliaries.useAdjacencyGraph(
    resolvedGeometry
  )
}

export const useAdjacencyGraph = (mesh: RefObject<Mesh | null>) => {
  return mesh.current ? getAdjacencyGraph(mesh.current) : undefined
}
