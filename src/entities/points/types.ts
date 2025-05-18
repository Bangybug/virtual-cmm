import { Object3D } from "three"
import { Points } from "../../cglib/builders/points"
import { TNodeKey } from "../types"

export type TPointCollection = {
  points: Points
  pointKeys: number[]
  lastPointKey: number
  key: TNodeKey
  selectedIndex?: number
  renderable: Object3D
}