import { useThree } from "@react-three/fiber"
import { PropsWithChildren } from "react"
import { surfaceContext, surfaceContextInstance } from "./contexts"

export const SurfaceContextProvider: React.FC<
  PropsWithChildren
> = ({ children }) => {
  surfaceContextInstance.setThreeState(useThree())

  return (
    <surfaceContext.Provider value={surfaceContextInstance}>
      {children}
    </surfaceContext.Provider>
  )
}