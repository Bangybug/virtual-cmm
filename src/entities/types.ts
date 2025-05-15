import { BaseEvent, Vector3Like } from "three"
import { EDialog } from "./store/ui-store"

export type TNodeKey = string

export type TNode = {
  class: EDialog
  label: string
  key: TNodeKey
}

export interface IEntitiesEvent extends BaseEvent {
  type: 'add' | 'remove' | 'open'
  node: TNode
}

export type TEntitiesEvents =  {
  add: IEntitiesEvent
  remove: IEntitiesEvent
  open: IEntitiesEvent
}

export type TPointCollection = {
  points: Vector3Like[]
  key: TNodeKey
}