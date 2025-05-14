import { BaseEvent } from "three"
import { EDialog } from "./store/ui-store"

export type TNode = {
  class: EDialog
  label: string
  key: string
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

