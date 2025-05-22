import { Group, Line, Object3D, Points } from "three"
import { Points as BuilderPoints } from "../../cglib/builders/points"
import { TNodeKey } from "../types"

export type TPointKey = number

export type TPointCollection = {
  points: BuilderPoints
  pointKeys: TPointKey[]
  lastPointKey: TPointKey
  key: TNodeKey
  selectedKey?: TPointKey
  renderable: Group
  pointsRenderable: Points
  segmentsRenderable: Line
}