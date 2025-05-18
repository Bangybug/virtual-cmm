import { BaseEvent } from "three"
import { EDialog } from "./store/ui-store"

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
