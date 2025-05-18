import { Object3D } from "three"
import { Points } from "../../cglib/builders/points"
import { TNodeKey } from "../types"

export type TPointKey = number

export type TPointCollection = {
  points: Points
  pointKeys: TPointKey[]
  lastPointKey: TPointKey
  key: TNodeKey
  selectedKey?: TPointKey
  renderable: Object3D
}