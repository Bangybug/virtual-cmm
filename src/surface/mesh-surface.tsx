import { BufferGeometry, Material, Mesh } from "three"
import { IModelProps, MeshFile } from "../mesh/mesh-file"
import { PropsWithChildren, Suspense, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useBVH } from "../hooks/use-bvh"
import { surfaceContext } from "./contexts"
import { TDisplayMode } from "./types"
import { SharedGeometryModel } from "../renderables/shared-geometry"
import { useAdjacencyGraph } from "../hooks/use-adjacency-graph"

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
      const onShow = (m: TDisplayMode) => {
        setShowWireframe(m.showWireframe)
      }

      surfaceContextInstance.addEventListener('displayMode', onShow)

      return () => {
        if (renderableMesh.current) {
          surfaceContextInstance.unregisterSurface(
            surfaceKey,
            renderableMesh.current
          )
        }
        surfaceContextInstance.removeEventListener('displayMode', onShow)
      }
    }, [])

    useBVH(renderableMesh, {
      verbose: true,
      isDisposeOnUnmount: true,
      onProgress: (perc) => {
        if (perc === 1) {
          useAdjacencyGraph(renderableMesh)
        }
      }
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


    return (<Suspense>
      <MeshFile<TMesh>
        {...restProps}
        {...surfaceContextInstance.mouseEvents}
        onLoad={({ mesh }) => {
          surfaceContextInstance.registerSurface({
            mesh,
            surfaceKey,
            source: restProps.url!
          })
        }}
        meshRef={renderableMesh}
      >
        {children}
        {wireframe && <primitive visible={showWireframe} object={wireframe.mesh} />}
      </MeshFile>
    </Suspense>)
  }