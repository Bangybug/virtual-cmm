import { useEffect, useState } from 'react'
import { entitiesContext } from '../../contexts'
import { IEntitiesEvent, TNode } from '../types'
import Form from 'react-bootstrap/esm/Form'
import { EDialog } from '../store/ui-store'
import { DraggableDialog } from './draggable-dialog'
import ListGroup from 'react-bootstrap/esm/ListGroup'
import { Decimal } from '../../cglib/rounding'
import { useRefState } from '../../hooks/use-ref-state'
import { TPointCollection } from '../points/types'

export const PointsDialog = () => {
  const [isVisible, setIsVisible] = useRefState(false)
  const [node, setNode] = useRefState<TNode | null>(null)
  const [data, setData] = useState<TPointCollection | undefined>(undefined)

  useEffect(() => {
    const openDialog = (event: IEntitiesEvent) => {
      const node = event.node
      if (node?.class === EDialog.PointsDialog) {
        setIsVisible(true)
        setNode(node)
        const p = entitiesContext.getPoints(node.key)
        setData(p ? {...p} : p)
      }
    }
    entitiesContext.addEventListener('open', openDialog)

    const onChange = (event: IEntitiesEvent) => {
      if (isVisible.current && event.node.key === node.current?.key) {
        const p = entitiesContext.getPoints(event.node.key)
        setData(p ? {...p} : p)
      }
    }
    entitiesContext.addEventListener('update', onChange)

    return () => {
      entitiesContext.removeEventListener('open', openDialog)
      entitiesContext.removeEventListener('update', onChange)
    }
  }, [])

  if (!isVisible.current || !node.current) {
    return null
  }

  const useNode = node.current

  return (
    <DraggableDialog
      title="Точки"
      dialogId={EDialog.PointsDialog}
      onClose={() => setIsVisible(false)}
      onRemove={() => {
        setIsVisible(false)
        entitiesContext.removeNode(useNode.key)
      }}
    >
      <br />
      <Form.Control
        type="text"
        placeholder="name"
        autoFocus
        value={useNode.label}
        onChange={(e) => {
          useNode.label = e.target.value
        }}
      />

      <ListGroup className="scrolled-list">
        {data?.points.map((p, i) => (
          <ListGroup.Item key={data.pointKeys[i]} action className="point">
            <span>{Decimal.round(p[0], 3)}</span>
            <span>{Decimal.round(p[1], 3)}</span>
            <span>{Decimal.round(p[2], 3)}</span>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </DraggableDialog>
  )
}
