import React from 'react'
import { Mesh } from 'three'
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
  MeshBVHOptions,
} from 'three-mesh-bvh'

export interface BVHOptions extends MeshBVHOptions {
  isDisposeOnUnmount?: boolean
}

export function useBVH(
  mesh: React.RefObject<Mesh | null>,
  options?: BVHOptions
) {
  React.useEffect(() => {
    if (mesh.current) {
      mesh.current.raycast = acceleratedRaycast
      const { geometry } = mesh.current
      const { isDisposeOnUnmount = true } = options || {}

      if (!geometry.boundsTree) {
        geometry.computeBoundsTree = computeBoundsTree
        geometry.disposeBoundsTree = disposeBoundsTree
        geometry.computeBoundsTree(options)

        if (isDisposeOnUnmount) {
          return () => {
            if (geometry.boundsTree) {
              geometry.disposeBoundsTree()
              geometry.boundsTree = undefined
            }
          }
        }
      }
    }

    return undefined
  }, [mesh, options])
}
