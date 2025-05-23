import { useCallback, useEffect, useState } from 'react'
import { entitiesContext, surfaceContextInstance } from '../../contexts'
import { IEntitiesEvent, TNode } from '../types'
import Form from 'react-bootstrap/esm/Form'
import { EDialog } from '../store/ui-store'
import { DraggableDialog } from './draggable-dialog'
import ListGroup from 'react-bootstrap/esm/ListGroup'
import { Decimal } from '../../cglib/rounding'
import { useRefState } from '../../hooks/use-ref-state'
import { TPointCollection } from '../points/types'
import NavDropdown from 'react-bootstrap/esm/NavDropdown'
import { Vector3 } from 'three'
import OverlayTrigger from 'react-bootstrap/esm/OverlayTrigger'
import Tooltip from 'react-bootstrap/esm/Tooltip'
import { Button } from 'react-bootstrap'
import { AlignMiddle, Bezier } from 'react-bootstrap-icons'

export const PointsDialog = () => {
  const [isVisible, setIsVisible] = useRefState(false)
  const [node, setNode] = useRefState<TNode | null>(null)
  const [label, setLabel] = useState('')
  const [data, setData] = useState<TPointCollection | undefined>(undefined)
  const [selected, setSelected] = useState<number | undefined>()

  useEffect(() => {
    const openDialog = (event: IEntitiesEvent) => {
      const node = event.node
      if (node?.class === EDialog.PointsDialog) {
        setIsVisible(true)
        setNode(node)
        setLabel(node.label)
        const p = entitiesContext.getPoints(node.key)
        setData(p ? { ...p } : p)
        setSelected(p?.selectedKey)
      }
    }
    entitiesContext.addEventListener('open', openDialog)

    const onChange = (event: IEntitiesEvent) => {
      if (isVisible.current && event.node.key === node.current?.key) {
        const p = entitiesContext.getPoints(event.node.key)
        setData(p ? { ...p } : p)
        setSelected(p?.selectedKey)
      }
    }
    entitiesContext.addEventListener('update', onChange)

    return () => {
      entitiesContext.removeEventListener('open', openDialog)
      entitiesContext.removeEventListener('update', onChange)
    }
  }, [])

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (
        !(e.target as HTMLDivElement)?.classList.contains('dropdown-toggle')
      ) {
        const next = Number(e.currentTarget?.dataset.id)

        setSelected((prev) => {
          const result = next === prev ? undefined : next
          const target = entitiesContext.getPoints(node.current?.key || '')
          if (target) {
            target.selectedKey = result
            if (next !== undefined) {
              const xyz = entitiesContext.points.getPointWithKey(
                node.current?.key!,
                next
              )
              if (xyz) {
                surfaceContextInstance.setCursorAtMeshPoint(
                  new Vector3().fromArray(xyz),
                  false
                )
              }
            }
          }
          return result
        })
      }
    },
    [node]
  )

  const onRemove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!e.currentTarget?.dataset.id || !node.current) {
        return
      }
      const pointKeyToRemove = Number(e.currentTarget?.dataset.id)
      const nextPointKey = entitiesContext.points.removePointByKey(
        node.current.key,
        pointKeyToRemove
      )
      setSelected(nextPointKey)
      surfaceContextInstance.invalidate()
      const p = entitiesContext.getPoints(node.current.key)
      setData(p ? { ...p } : p)
    },
    [node]
  )

  const createNurbsCurve = useCallback(() => {
    if (!node.current) {
      return
    }
    entitiesContext.makeCurveFromPoints(node.current.key)
    surfaceContextInstance.invalidate()
  }, [node])

  const createCrossSection = useCallback(() => {
    if (!node.current) {
      return
    }
    entitiesContext.makeCrossSection(node.current.key)
    surfaceContextInstance.invalidate()
  }, [node])

  if (!isVisible.current || !node.current) {
    return null
  }

  const useNode = node.current

  return (
    <DraggableDialog
      title="Точки"
      dialogId={EDialog.PointsDialog}
      onClose={() => setIsVisible(false)}
      footerMenu={
        <>
          <OverlayTrigger
            placement={'bottom'}
            delay={{ show: 250, hide: 400 }}
            overlay={
              <Tooltip>Сечение по первым двум точкам и нормали сетки</Tooltip>
            }
          >
            {/* @ts-ignore-next-line */}
            <Button
              variant="secondary"
              id="create-crossection"
              onClick={createCrossSection}
            >
              <AlignMiddle />
            </Button>
          </OverlayTrigger>
          &nbsp;
          <OverlayTrigger
            placement={'bottom'}
            delay={{ show: 250, hide: 400 }}
            overlay={<Tooltip>Построить интерполяционную кривую NURBS</Tooltip>}
          >
            {/* @ts-ignore-next-line */}
            <Button
              variant="secondary"
              id="interpolate-nurbs"
              onClick={createNurbsCurve}
            >
              <Bezier />
            </Button>
          </OverlayTrigger>
          &nbsp;
        </>
      }
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
        value={label}
        onChange={(e) => {
          useNode.label = e.target.value
          setLabel(useNode.label)
          entitiesContext.updateNode(useNode)
        }}
      />

      <ListGroup className="scrolled-list">
        {data?.points.map((p, i) => (
          <ListGroup.Item
            key={data.pointKeys[i]}
            data-id={String(data.pointKeys[i])}
            className="point"
            variant={selected === data.pointKeys[i] ? 'primary' : undefined}
            action
            onClick={onClick}
          >
            <span>{Decimal.round(p[0], 3)}</span>
            <span>{Decimal.round(p[1], 3)}</span>
            <span>{Decimal.round(p[2], 3)}</span>

            {selected === data.pointKeys[i] && (
              <NavDropdown
                id="nav-dropdown-dark-example"
                title="&nbsp;"
                menuVariant="dark"
              >
                <NavDropdown.Item
                  data-id={String(data.pointKeys[i])}
                  onClick={onRemove}
                >
                  Remove
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </DraggableDialog>
  )
}
