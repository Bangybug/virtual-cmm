import { Canvas } from "@react-three/fiber"
import { VIEWER_BOTTOM_SHADE_COLOR, VIEWER_CLEAR_COLOR, VIEWER_LIGHT_COLOR } from "./colors"
import { PropsWithChildren } from "react"
import { GizmoHelper, GizmoViewcube, OrbitControls, OrthographicCamera } from "@react-three/drei"
import { surfaceContextInstance } from "../contexts"

export const Scene = (props: PropsWithChildren) => {
  const { mouseEvents } = surfaceContextInstance

  return (<Canvas
    frameloop="demand"
    onPointerMove={mouseEvents.onPointerCanvasMove}
    onPointerOut={mouseEvents.onPointerCanvasOut}
    onPointerUp={mouseEvents.onPointerUpCanvas}
    onPointerDown={mouseEvents.onPointerDownCanvas}
    onWheel={mouseEvents.onWheelCanvas}
    style={{ background: VIEWER_CLEAR_COLOR, zIndex: 0 }}
    gl={{ alpha: false, powerPreference: 'default' }}
    onCreated={({ gl }) => {
      gl.setClearColor(VIEWER_CLEAR_COLOR)
      gl.localClippingEnabled = true
    }}
  >
    {props.children}

    <OrthographicCamera
      makeDefault
      position={[0, 0, 1000]}
      zoom={6000}
    >
      <object3D rotation={[0.0, 0.4, 0.4]}>
        <directionalLight
          intensity={0.4}
          color={VIEWER_LIGHT_COLOR}
          position={[0, -200, 100]}
        />
      </object3D>
    </OrthographicCamera>

    <hemisphereLight
      color={VIEWER_LIGHT_COLOR}
      groundColor={VIEWER_BOTTOM_SHADE_COLOR}
      position={[-7, 25, 13]}
      intensity={0.7}
    />

    <OrbitControls
      enablePan={true}
      makeDefault 
      onStart={surfaceContextInstance.onCameraStart} 
      onEnd={surfaceContextInstance.onCameraEnd} />

    <GizmoHelper
      alignment="bottom-right"
      margin={[80, 80]}
    >
      <GizmoViewcube />
    </GizmoHelper>

  </Canvas>)
}