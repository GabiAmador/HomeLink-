import {
  Routes,
  Route,
} from 'react-router-dom'

import Navbar from './components/Navbar'
import RutaProtegida from './components/RutaProtegida'

import Home from './pages/Home'
import Inmuebles from './pages/Inmuebles'
import DetalleInmueble from './pages/DetalleInmueble'
import PublicarInmueble from './pages/PublicarInmueble'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Dashboard from './pages/Dashboard'
import EditarInmueble from './pages/EditarInmueble'

import '../css/app.css'


function App() {

  return (

    <>

      <Navbar />


      <Routes>


        {/* ================================================
            RUTAS PÚBLICAS
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />


        <Route
          path="/inmuebles"
          element={<Inmuebles />}
        />


        <Route
          path="/inmuebles/:id"
          element={<DetalleInmueble />}
        />


        <Route
          path="/login"
          element={<Login />}
        />


        <Route
          path="/registro"
          element={<Registro />}
        />


        {/* ================================================
            RUTAS PROTEGIDAS
        ================================================= */}


        {/* PUBLICAR INMUEBLE */}

        <Route
          path="/publicar"
          element={
            <RutaProtegida>

              <PublicarInmueble />

            </RutaProtegida>
          }
        />


        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <RutaProtegida>

              <Dashboard />

            </RutaProtegida>
          }
        />


        {/* EDITAR INMUEBLE */}

        <Route
          path="/dashboard/inmuebles/:id/editar"
          element={
            <RutaProtegida>

              <EditarInmueble />

            </RutaProtegida>
          }
        />


      </Routes>

    </>

  )

}

export default App