import { BufferGeometry, Material, Mesh } from "three"
import { IModelProps, MeshFile } from "../mesh/mesh-file"
import { PropsWithChildren, useContext, useEffect, useRef } from "react"
import { useBVH } from "../hooks/use-bvh"
import { surfaceContext } from "./contexts"

type TMesh = Mesh<BufferGeometry, Material>

interface IEditableSurfaceProps extends IModelProps<TMesh> {
  surfaceKey: string
}

export const MeshSurface: React.FC<
  PropsWithChildren<IEditableSurfaceProps>
> = ({
  children,
  surfaceKey,
  ...restProps
}) => {
    const renderableMesh = useRef<TMesh>(null)

    const surfaceContextInstance = useContext(surfaceContext)

    useEffect(() => {
      const mesh = renderableMesh.current
      if (mesh) {
        // const { geometry } = renderableMesh.current
        // surfaceContextInstance.meshState.saveOriginalFaceIndex(surfaceKey, geometry)
        // ensureNormalsAvailable(geometry)

        surfaceContextInstance.registerSurface({
          mesh,
          surfaceKey,
          source: restProps.url!
        })

        return () => {
          surfaceContextInstance.unregisterSurface(
            surfaceKey,
            mesh
          )
        }
      }
    }, [renderableMesh.current, surfaceContextInstance, surfaceKey])

    useBVH(renderableMesh, {
      verbose: true,
      splitStrategy: "SAH",
      isDisposeOnUnmount: true,
    })

    return <MeshFile<TMesh>
      {...restProps}
      {...surfaceContextInstance.mouseEvents}
      meshRef={renderableMesh}
    >
      {children}
    </MeshFile >
  }