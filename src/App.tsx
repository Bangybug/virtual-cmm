import 'bootstrap/dist/css/bootstrap.min.css';
import Nav from 'react-bootstrap/esm/Nav';
import Navbar from 'react-bootstrap/esm/Navbar';
import NavDropdown from 'react-bootstrap/esm/NavDropdown';
import { Scene } from './scene/scene';
import { MeshFile } from './mesh/mesh-file';

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
          </Navbar.Collapse>
        </Navbar>
      </header>
      <main className="w-100 d-flex align-items-stretch flex-grow-1">
        <Scene>
          <MeshFile fileType={'stl'} url='spoon.stl'>
            <meshStandardMaterial />
          </MeshFile>
        </Scene>
      </main >
    </>
  )
}

export default App
