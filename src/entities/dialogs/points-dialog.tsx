import { useEffect, useRef, useState } from 'react'
import Button from 'react-bootstrap/esm/Button'
import Modal from 'react-bootstrap/esm/Modal'
import { entitiesContext, uiStore } from '../../contexts'
import { IEntitiesEvent } from '../types'
import { useDraggable } from '../../hooks/use-draggable'
import Card from 'react-bootstrap/esm/Card'
import Form from 'react-bootstrap/esm/Form'
import { ResizableBox } from 'react-resizable'
import { EDialog } from '../store/ui-store'

export const PointsDialog = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const openDialog = (event: IEntitiesEvent) => {
      if (event.node.class === 'points') {
        setIsVisible(true)
      }
    }
    entitiesContext.addEventListener('open', openDialog)

    return () => {
      entitiesContext.removeEventListener('open', openDialog)
    }
  }, [])

  const modal = useRef<HTMLDivElement>(null)

  useDraggable(modal, EDialog.PointsDialog, isVisible)

  if (!isVisible) {
    return null
  }

  const settings = uiStore.getSettings(EDialog.PointsDialog)

  return (
    <div
      className="centered"
      ref={modal}
      style={{ transform: 'translate(-50%, -50%)' }}
    >
      <ResizableBox
        className="box hover-handles"
        width={settings?.width || 400}
        height={settings?.height || 300}
        onResizeStop={(e, data) => {
          uiStore.updateSettings(EDialog.PointsDialog, {
            ...(settings || { left: 0, top: 0 }),
            width: data.size.width,
            height: data.size.height,
          })
        }}
      >
        <Card style={{ padding: 10, width: '100%', height: '100%' }}>
          <Modal.Header
            closeButton
            onHide={() => {
              setIsVisible(false)
            }}
          >
            <Modal.Title id="contained-modal-title-vcenter">Точки</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Название</Form.Label>
                <Form.Control type="text" placeholder="name" autoFocus />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            {/* @ts-ignore-next-line */}
            <Button
              onClick={() => {
                setIsVisible(false)
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Card>
      </ResizableBox>
    </div>
  )
}
