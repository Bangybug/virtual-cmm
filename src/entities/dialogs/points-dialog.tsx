import { useEffect, useState } from 'react'
import { entitiesContext } from '../../contexts'
import { IEntitiesEvent, TNode } from '../types'
import Form from 'react-bootstrap/esm/Form'
import { EDialog } from '../store/ui-store'
import { DraggableDialog } from './draggable-dialog'
import ListGroup from 'react-bootstrap/esm/ListGroup'

export const PointsDialog = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [node, setNode] = useState<TNode | null>(null)

  useEffect(() => {
    const openDialog = (event: IEntitiesEvent) => {
      if (event.node.class === EDialog.PointsDialog) {
        setIsVisible(true)
        setNode(event.node)
      }
    }
    entitiesContext.addEventListener('open', openDialog)

    return () => {
      entitiesContext.removeEventListener('open', openDialog)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <DraggableDialog
      title="Точки"
      dialogId={EDialog.PointsDialog}
      onClose={() => setIsVisible(false)}
    >
      <br />
      <Form.Control
        type="text"
        placeholder="name"
        autoFocus
        value={node?.label}
      />

      <ListGroup className="scrolled-list">
        <ListGroup.Item>Cras justo odio</ListGroup.Item>
        <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
        <ListGroup.Item>Morbi leo risus</ListGroup.Item>
        <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
        <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
      </ListGroup>
    </DraggableDialog>
  )
}
