import { useThree } from "@react-three/fiber"
import { PropsWithChildren, useEffect } from "react"
import { surfaceContext, surfaceContextInstance } from "../contexts"

export const SurfaceContextProvider: React.FC<
  PropsWithChildren
> = ({ children }) => {
  surfaceContextInstance.setThreeState(useThree())

  useEffect(() => {
    const onOut = () => surfaceContextInstance.mouseEvents.onPointerCanvasOut?.()
    window.addEventListener('focusout', onOut)
    window.addEventListener('blur', onOut)

    return () => {
      window.removeEventListener('focusout', onOut)
      window.removeEventListener('blur', onOut)
    }
  }, [])

  return (
    <surfaceContext.Provider value={surfaceContextInstance}>
      {children}
    </surfaceContext.Provider>
  )
}