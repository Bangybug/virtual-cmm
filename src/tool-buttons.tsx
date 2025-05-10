import { useState, useEffect } from 'react';
import { OverlayTrigger, Tooltip, ToggleButton } from 'react-bootstrap';
import { Map, Geo } from 'react-bootstrap-icons';
import { surfaceContextInstance } from './surface/contexts';

export const ToolButtons = () => {
  const [showWireframe, setShowWireframe] = useState(false)
  const [capturePoints, setCapturePoints] = useState(true)

  useEffect(() => {
    surfaceContextInstance.setShowWireframe(showWireframe)
  }, [showWireframe])

  return (<>
    <OverlayTrigger
      placement={'bottom'}
      delay={{ show: 250, hide: 400 }}
      overlay={
        <Tooltip>
          Включить щуп
        </Tooltip>
      }
    >
      <ToggleButton
        id="toggle-check-capture-points"
        type="checkbox"
        variant={capturePoints ? 'primary' : 'secondary'}
        checked={capturePoints}
        value="1"
        onChange={(e) => setCapturePoints(e.currentTarget.checked)}
      >
        <Geo />
      </ToggleButton>
    </OverlayTrigger>

    <OverlayTrigger
      placement={'bottom'}
      delay={{ show: 250, hide: 400 }}
      overlay={
        <Tooltip>
          Показать сетку
        </Tooltip>
      }
    >
      <ToggleButton
        id="toggle-check-wireframe"
        type="checkbox"
        variant={showWireframe ? 'primary' : 'secondary'}
        checked={showWireframe}
        value="1"
        onChange={(e) => setShowWireframe(e.currentTarget.checked)}
      >
        <Map />
      </ToggleButton>
    </OverlayTrigger>
  </>)
}