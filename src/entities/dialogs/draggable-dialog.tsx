import { PropsWithChildren, useRef } from 'react'
import Button from 'react-bootstrap/esm/Button'
import Modal from 'react-bootstrap/esm/Modal'
import { uiStore } from '../../contexts'
import { useDraggable } from '../../hooks/use-draggable'
import Card from 'react-bootstrap/esm/Card'
import { ResizableBox } from 'react-resizable'
import { EDialog } from '../store/ui-store'
import { Trash } from 'react-bootstrap-icons';

type TDraggableDialogProps = PropsWithChildren<{
  title: string
  dialogId: EDialog
  onClose: () => void
  onRemove?: () => void
}>

export const DraggableDialog = ({
  title,
  dialogId,
  children,
  onRemove,
  onClose,
}: TDraggableDialogProps) => {
  const modal = useRef<HTMLDivElement>(null)

  useDraggable(modal, dialogId)

  const settings = uiStore.getSettings(dialogId)

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
          uiStore.updateSettings(dialogId, {
            ...(settings || { left: 0, top: 0 }),
            width: data.size.width,
            height: data.size.height,
          })
        }}
      >
        <Card className='dialog'>
          <Modal.Header
            closeButton
            style={{ userSelect: 'none' }}
            onHide={onClose}
          >
            <Modal.Title
              style={{ pointerEvents: 'none' }}
              id="contained-modal-title-vcenter"
            >
              {title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>{children}</Modal.Body>
          <Modal.Footer>
            {/* @ts-ignore-next-line */}
            {onRemove && (<Button onClick={onRemove}><Trash/></Button>)}
            &nbsp;
            {/* @ts-ignore-next-line */}
            <Button onClick={onClose}>Close</Button>
          </Modal.Footer>
        </Card>
      </ResizableBox>
    </div>
  )
}
