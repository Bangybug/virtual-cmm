import { RefObject } from 'react'
import { BufferGeometry, Mesh } from 'three'
import { surfaceContextInstance } from '../contexts'

export const useSphereVolumeQuery = (
  mesh: RefObject<Mesh | undefined>
) => {
  return mesh.current ? getClipQuery(mesh.current) : undefined
}

export const getClipQuery = (
  model: Mesh | BufferGeometry
) => {
  const mesh = model as Mesh
  const geometry = model as BufferGeometry
  const resolvedGeometry = mesh.isMesh ? mesh.geometry : geometry

  return surfaceContextInstance.auxiliaries.useClipQuery(
    resolvedGeometry
  )
}
