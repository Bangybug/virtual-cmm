import 'bootstrap/dist/css/bootstrap.min.css';
import './entities/style.css'
import 'react-resizable/css/styles.css'
import Nav from 'react-bootstrap/esm/Nav';
import Navbar from 'react-bootstrap/esm/Navbar';
import NavDropdown from 'react-bootstrap/esm/NavDropdown';
import { Scene } from './scene/scene';
import { SurfaceContextProvider } from './surface/surface-context-provider';
import { MeshSurface } from './surface/mesh-surface';
import { ButtonGroup } from 'react-bootstrap';
import { ToolButtons } from './tool-buttons';
import { Tree } from './entities/tree/tree';
import { PointsDialog } from './entities/dialogs/points-dialog';

function App() {

  return (
    <>
      <header className="p-3">
        <Navbar expand="xxl">
          <Navbar.Brand>Сканер</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <NavDropdown title="Настройки" id="basic-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                  Another action
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">
                  Separated link
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>

            <ButtonGroup className="mb-2">
              <ToolButtons />
            </ButtonGroup>
          </Navbar.Collapse>
        </Navbar>
      </header>
      <main className="w-100 d-flex align-items-stretch flex-grow-1" style={{ position: 'relative' }}>
        <Scene>
          <SurfaceContextProvider>
            <MeshSurface surfaceKey={'scan'} fileType={'stl'} url='spoon.stl'>
              <meshStandardMaterial
                roughness={0.3}
                metalness={0.2}
                emissive={'#222222'}
                emissiveIntensity={0.5} />
            </MeshSurface>
          </SurfaceContextProvider>
        </Scene>
        <div style={{ marginRight: 20, right: 0, height: '100%', position: 'absolute', pointerEvents: 'none' }}>
          <Tree />
        </div>
        <PointsDialog />
      </main >
    </>
  )
}

export default App
