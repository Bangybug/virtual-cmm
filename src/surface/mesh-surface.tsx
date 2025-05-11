import { BufferGeometry, Material, Mesh } from "three"
import { IModelProps, MeshFile } from "../mesh/mesh-file"
import { PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useBVH } from "../hooks/use-bvh"
import { surfaceContext } from "./contexts"
import { TDisplayMode } from "./types"
import { SharedGeometryModel } from "../renderables/shared-geometry"

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

    const [showWireframe, setShowWireframe] = useState(false)

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

        const onShow = (m: TDisplayMode) => {
          setShowWireframe(m.showWireframe)
        }

        surfaceContextInstance.addEventListener('displayMode', onShow)

        return () => {
          surfaceContextInstance.unregisterSurface(
            surfaceKey,
            mesh
          )
          surfaceContextInstance.removeEventListener('displayMode', onShow)
        }
      }
    }, [renderableMesh.current, surfaceContextInstance, surfaceKey])

    useBVH(renderableMesh, {
      verbose: true,
      splitStrategy: "SAH",
      isDisposeOnUnmount: true,
    })

    const wireframe = useMemo(() => {
      if (renderableMesh.current && showWireframe) {
        const { geometry } = renderableMesh.current
        const sharedGeometryModel = new SharedGeometryModel({ isWireframe: true })
        sharedGeometryModel.setSourceGeometry(geometry)
        return sharedGeometryModel
      }

      return undefined
    }, [renderableMesh.current])


    return <MeshFile<TMesh>
      {...restProps}
      {...surfaceContextInstance.mouseEvents}
      meshRef={renderableMesh}
    >
      {children}
      {wireframe && <primitive visible={showWireframe} object={wireframe.mesh} />}
    </MeshFile >
  }