import { AlwaysStencilFunc, BackSide, BufferGeometry, DecrementWrapStencilOp, FrontSide, IncrementWrapStencilOp, Plane } from "three";

type TSurfaceStencilClipProps = {
  geometry: BufferGeometry
  plane: Plane
  renderOrder: number
}

export const SurfaceStencilClip = ({ geometry, plane, renderOrder }: TSurfaceStencilClipProps) => {
  return (
    <>
      {/* <mesh geometry={geometry} renderOrder={renderOrder}>
        <meshBasicMaterial
          depthWrite={false}
          depthTest={false}
          colorWrite={false}
          side={FrontSide}
          clippingPlanes={[plane]}
          stencilWrite={true}
          stencilFunc={AlwaysStencilFunc}
          stencilFail={DecrementWrapStencilOp}
          stencilZFail={DecrementWrapStencilOp}
          stencilZPass={DecrementWrapStencilOp}
        />
      </mesh> */}
  
      <mesh geometry={geometry} renderOrder={renderOrder}>
        <meshBasicMaterial
          depthWrite={true}
          depthTest={true}
          colorWrite={true}
          side={BackSide}
          color={0x07dfe3}
          clippingPlanes={[plane]}
          // stencilWrite={true}
          // stencilFunc={AlwaysStencilFunc}
          // stencilFail={IncrementWrapStencilOp}
          // stencilZFail={IncrementWrapStencilOp}
          // stencilZPass={IncrementWrapStencilOp}
        />
      </mesh>
    </>
  );
}