import { BaseEvent, Object3D } from "three"
import { EDialog } from "./store/ui-store"
import { Points } from "../cglib/builders/points"

export type TNodeKey = string

export type TNode = {
  class: EDialog
  label: string
  key: TNodeKey
}

export interface IEntitiesEvent extends BaseEvent {
  type: 'add' | 'remove' | 'open' | 'update'
  node: TNode
}

export type TEntitiesEvents =  {
  add: IEntitiesEvent
  remove: IEntitiesEvent
  open: IEntitiesEvent
  update: IEntitiesEvent
}

export type TPointCollection = {
  points: Points
  key: TNodeKey
  selectedIndex?: number
  renderable: Object3D
}