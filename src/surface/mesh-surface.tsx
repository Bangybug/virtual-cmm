import { BufferGeometry, Material, Mesh, Object3D, Plane as ThreePlane } from "three"
import { IModelProps, MeshFile } from "../mesh/mesh-file"
import { createRef, PropsWithChildren, Suspense, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useBVH } from "../hooks/use-bvh"
import { entitiesContext, surfaceContext } from "../contexts"
import { TCrossSectionDisplay, TDisplayMode } from "./types"
import { SharedGeometryModel } from "../renderables/shared-geometry"
import { useAdjacencyGraph } from "../hooks/use-adjacency-graph"
import { useRefState } from "../hooks/use-ref-state"
import { SurfaceStencilClip } from "./surface-stencil-clip"

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
    const [renderableMesh, setRenderableMesh] = useRefState<TMesh | null>(null)
    const surfaceContextInstance = useContext(surfaceContext)
    const [showWireframe, setShowWireframe] = useState(false)
    const [isClippingEnabled, setClippingEnabled] = useState(false)
    const planeMeshRef = createRef<Object3D>()
    const clippingPlanes = useRef<ThreePlane[]>([])

    useEffect(() => {
      const onShow = (m: TDisplayMode) => {
        setShowWireframe(m.showWireframe)
      }

      const onCrossSectionDisplay = ({ visible, surface, plane }: TCrossSectionDisplay) => {
        if (surface.surfaceKey !== surfaceKey) {
          return
        }
        if (visible && plane) {
          clippingPlanes.current = [plane]
          setClippingEnabled(true)
        } else {
          setClippingEnabled(false)
        }
      }

      surfaceContextInstance.addEventListener('displayMode', onShow)
      surfaceContextInstance.addEventListener('crossSectionDisplay', onCrossSectionDisplay)
      return () => {
        surfaceContextInstance.removeEventListener('displayMode', onShow)
        surfaceContextInstance.removeEventListener('crossSectionDisplay', onCrossSectionDisplay)
      }
    }, [])

    useEffect(() => {
      const mesh = renderableMesh.current
      if (mesh) {
        return () => {
          surfaceContextInstance.unregisterSurface(
            surfaceKey,
            mesh
          )
        }
      }
    }, [surfaceKey])

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
      if (renderableMesh.current) {
        const { geometry } = renderableMesh.current
        const sharedGeometryModel = new SharedGeometryModel({ isWireframe: true })
        sharedGeometryModel.setSourceGeometry(geometry)
        return sharedGeometryModel
      }

      return undefined
    }, [renderableMesh.current])


    return (
      <Suspense>
        <MeshFile<TMesh>
          {...restProps}
          {...surfaceContextInstance.surfaceEvents}
          onLoad={({ mesh }) => {
            surfaceContextInstance.registerSurface({
              mesh,
              surfaceKey,
              source: restProps.url!
            })
            setRenderableMesh(mesh)
            restProps.onLoad?.({ mesh, props: restProps })
            entitiesContext.setMesh(mesh)
          }}
        >
          {children}

          <meshStandardMaterial
            roughness={0.3}
            metalness={0.2}
            emissive={0x333333}
            emissiveIntensity={0.5}
            clippingPlanes={isClippingEnabled ? clippingPlanes.current : []}
          />

          {isClippingEnabled && renderableMesh.current && (<>
            <SurfaceStencilClip
              geometry={renderableMesh.current.geometry}
              plane={clippingPlanes.current[0]}
              renderOrder={1} />

            {/* <Plane
              args={[4, 4]}
              renderOrder={0.9}
              ref={(planeMesh) => {
                if (planeMesh) {
                  const fromPlane = clippingPlanes.current[0]
                  fromPlane.coplanarPoint(planeMesh.position);
                  planeMesh.lookAt(
                    planeMesh.position.x - fromPlane.normal.x,
                    planeMesh.position.y - fromPlane.normal.y,
                    planeMesh.position.z - fromPlane.normal.z
                  );
                }
              }}
              onAfterRender={(gl) => gl.clearStencil()}
            >
              <meshStandardMaterial
                color={0xe91e63}
                metalness={0.1}
                roughness={0.75}
                // clippingPlanes={planes.filter((_, i) => i !== index)}
                stencilWrite={true}
                stencilRef={0}
                stencilFunc={NotEqualStencilFunc}
                stencilFail={ReplaceStencilOp}
                stencilZFail={ReplaceStencilOp}
                stencilZPass={ReplaceStencilOp}
              />
            </Plane> */}
          </>)}

          {wireframe && <primitive visible={showWireframe} object={wireframe.mesh} />}
        </MeshFile>
      </Suspense>)
  }