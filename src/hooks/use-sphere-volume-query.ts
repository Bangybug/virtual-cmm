import { RefObject } from 'react'
import { BufferGeometry, Mesh } from 'three'
import { surfaceContextInstance } from '../contexts'

export const useSphereVolumeQuery = (
  mesh: RefObject<Mesh | undefined>
) => {
  return getSphereVolumeQuery(mesh.current)
}

export const getSphereVolumeQuery = (
  model: Mesh | BufferGeometry | undefined
) => {
  if (model) {
    const mesh = model as Mesh
    const geometry = model as BufferGeometry
    const resolvedGeometry = mesh.isMesh ? mesh.geometry : geometry

    return surfaceContextInstance.auxiliaries.useSphereVolumeQuery(
      resolvedGeometry
    )
  }

  return undefined
}
