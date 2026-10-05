import { useEffect, useState } from 'react'

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  obtenerUsuarioGuardado,
  cerrarSesionLocal,
  obtenerToken,
} from '../services/auth'


function Navbar() {

  const navigate = useNavigate()
  const location = useLocation()


  const [
    usuario,
    setUsuario,
  ] = useState(
    obtenerUsuarioGuardado()
  )


  /* ======================================================
     MENÚ DEL USUARIO
  ====================================================== */

  const [
    menuAbierto,
    setMenuAbierto,
  ] = useState(false)


  /* ======================================================
     MENÚ MÓVIL
  ====================================================== */

  const [
    menuMovilAbierto,
    setMenuMovilAbierto,
  ] = useState(false)


  /* ======================================================
     DETECTAR PÁGINA ACTUAL
  ====================================================== */

  const esInicio =
    location.pathname === '/'


  const esPropiedades =
    location.pathname === '/inmuebles' ||
    location.pathname.startsWith('/inmuebles/')


  const esPublicar =
    location.pathname === '/publicar'


  const esDashboard =
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/dashboard/')


  /* Login y Registro */

  const esLogin =
    location.pathname === '/login'


  const esRegistro =
    location.pathname === '/registro'


  const esAuth =
    esLogin ||
    esRegistro


  /* ======================================================
     ACTUALIZAR USUARIO
  ====================================================== */

  useEffect(() => {

    const actualizarUsuario = () => {

      setUsuario(
        obtenerUsuarioGuardado()
      )

    }


    window.addEventListener(
      'usuarioActualizado',
      actualizarUsuario
    )


    return () => {

      window.removeEventListener(
        'usuarioActualizado',
        actualizarUsuario
      )

    }

  }, [])


  /* ======================================================
     CERRAR MENÚS AL CAMBIAR DE PÁGINA
  ====================================================== */

  useEffect(() => {

    setMenuAbierto(false)
    setMenuMovilAbierto(false)

  }, [location.pathname])


  /* ======================================================
     OBTENER INICIALES
  ====================================================== */

  function obtenerIniciales(nombre) {

    if (!nombre) {
      return 'U'
    }


    const partes =
      nombre
        .trim()
        .split(' ')
        .filter(Boolean)


    if (partes.length === 1) {

      return partes[0]
        .substring(0, 2)
        .toUpperCase()

    }


    return (
      partes[0][0] +
      partes[1][0]
    ).toUpperCase()

  }


  /* ======================================================
     CERRAR SESIÓN
  ====================================================== */

  async function cerrarSesion() {

    const token =
      obtenerToken()


    try {

      if (token) {

        await fetch(
          '/api/logout',
          {
            method: 'POST',

            headers: {

              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,

            },
          }
        )

      }

    } catch (error) {

      console.error(
        'No se pudo cerrar la sesión en el servidor:',
        error
      )

    }


    /*
     * La sesión local se elimina incluso si
     * ocurre algún problema con la petición.
     */

    cerrarSesionLocal()

    setUsuario(null)

    setMenuAbierto(false)

    setMenuMovilAbierto(false)

    navigate('/')

  }


  /* ======================================================
     CLASES DINÁMICAS DEL NAVBAR
  ====================================================== */

  const claseNavbar = [

    'hl-navbar',


    esInicio
      ? 'hl-navbar-inicio'
      : '',


    esPropiedades
      ? 'hl-navbar-propiedades'
      : '',


    esPublicar
      ? 'hl-navbar-publicar'
      : '',


    esDashboard
      ? 'hl-navbar-dashboard'
      : '',


    /*
     * Esta clase se utiliza para aplicar
     * el Navbar oscuro en Login y Registro.
     */

    esAuth
      ? 'hl-navbar-auth'
      : '',

  ]
    .filter(Boolean)
    .join(' ')


  /* ======================================================
     BOTÓN DERECHO CUANDO NO HAY SESIÓN
  ====================================================== */

  /*
   * Login:
   * muestra "Crear cuenta".
   *
   * Registro y demás páginas:
   * muestra "Iniciar sesión".
   */

  const enlaceAcceso =
    esLogin
      ? '/registro'
      : '/login'


  const textoAcceso =
    esLogin
      ? 'Crear cuenta'
      : 'Iniciar sesión'


  /* ======================================================
     INTERFAZ
  ====================================================== */

  return (

    <header className={claseNavbar}>


      {/* ==================================================
          LOGO
      ================================================== */}

      <Link
        to="/"
        className="hl-brand"
        onClick={() =>
          setMenuMovilAbierto(false)
        }
      >
        <img
          src="/images/logo-homelink.png"
          alt="Logo HomeLink"
          className="hl-brand-logo"
        />

        <span className="hl-brand-name">
          HomeLink<span>.</span>
        </span>
      </Link>


      {/* ==================================================
          NAVEGACIÓN PRINCIPAL — COMPUTADORA
      ================================================== */}

      <nav className="hl-navigation">


        {/* INICIO */}

        <Link
          to="/"
          className={
            esInicio
              ? 'hl-nav-activo'
              : ''
          }
        >
          Inicio
        </Link>


        {/* PROPIEDADES */}

        <Link
          to="/inmuebles"
          className={
            esPropiedades
              ? 'hl-nav-activo'
              : ''
          }
        >
          Propiedades
        </Link>


        {/* =================================================
            PUBLICAR

            HomeLink utiliza una sola cuenta.
            Cualquier usuario autenticado puede publicar.
        ================================================= */}

        {usuario && (

          <Link
            to="/publicar"
            className={
              esPublicar
                ? 'hl-nav-activo'
                : ''
            }
          >
            Publicar
          </Link>

        )}


        {/* NOSOTROS */}

        <a href="/#nosotros">
          Nosotros
        </a>


        {/* CONTACTO */}

        <a href="/#contacto">
          Contacto
        </a>


      </nav>


      {/* ==================================================
          BOTÓN MENÚ MÓVIL
      ================================================== */}

      <button
        type="button"
        className={
          `hl-mobile-menu-button ${menuMovilAbierto
            ? 'abierto'
            : ''
          }`
        }
        onClick={() => {

          setMenuMovilAbierto(
            (actual) => !actual
          )

          setMenuAbierto(false)

        }}
        aria-label={
          menuMovilAbierto
            ? 'Cerrar menú'
            : 'Abrir menú'
        }
        aria-expanded={
          menuMovilAbierto
        }
      >

        <span></span>
        <span></span>
        <span></span>

      </button>


      {/* ==================================================
          PARTE DERECHA
      ================================================== */}

      <div className="hl-navbar-right">


        {/* =================================================
            USUARIO NO AUTENTICADO
        ================================================= */}

        {!usuario ? (

          <Link
            to={enlaceAcceso}
            className="hl-login"
          >

            {textoAcceso}

            <span>
              ↗
            </span>

          </Link>

        ) : (


          /* ===============================================
             USUARIO AUTENTICADO
          =============================================== */

          <div className="hl-user">


            {/* BOTÓN DEL PERFIL */}

            <button
              type="button"
              className="hl-user-button"
              onClick={() => {

                setMenuAbierto(
                  (actual) => !actual
                )

                setMenuMovilAbierto(false)

              }}
              aria-expanded={
                menuAbierto
              }
              aria-label="Abrir menú de usuario"
            >


              {/* AVATAR */}

              <span className="hl-avatar">

                {obtenerIniciales(
                  usuario.name
                )}

              </span>


              {/* INFORMACIÓN */}

              <span className="hl-user-text">

                <strong>
                  {usuario.name}
                </strong>

                <small>
                  Cuenta HomeLink
                </small>

              </span>


              {/* FLECHA */}

              <span
                className={
                  menuAbierto
                    ? 'hl-user-arrow abierto'
                    : 'hl-user-arrow'
                }
              >
                ↓
              </span>


            </button>


            {/* =============================================
                MENÚ DESPLEGABLE DEL USUARIO
            ============================================= */}

            {menuAbierto && (

              <div className="hl-user-menu">


                {/* DATOS DEL USUARIO */}

                <div className="hl-user-menu-header">

                  <strong>
                    {usuario.name}
                  </strong>

                  <span>
                    {usuario.email}
                  </span>

                </div>


                {/* MI ESPACIO */}

                <Link
                  to="/dashboard"
                  onClick={() =>
                    setMenuAbierto(false)
                  }
                >
                  Mi espacio
                </Link>


                {/* EXPLORAR */}

                <Link
                  to="/inmuebles"
                  onClick={() =>
                    setMenuAbierto(false)
                  }
                >
                  Explorar propiedades
                </Link>


                {/* PUBLICAR */}

                <Link
                  to="/publicar"
                  onClick={() =>
                    setMenuAbierto(false)
                  }
                >
                  Publicar inmueble
                </Link>


                {/* CERRAR SESIÓN */}

                <button
                  type="button"
                  onClick={cerrarSesion}
                >
                  Cerrar sesión
                </button>


              </div>

            )}


          </div>

        )}


      </div>


      {/* ==================================================
          MENÚ DE NAVEGACIÓN MÓVIL
      ================================================== */}

      {menuMovilAbierto && (

        <div className="hl-mobile-menu">


          {/* INICIO */}

          <Link
            to="/"
            className={
              esInicio
                ? 'hl-mobile-menu-activo'
                : ''
            }
            onClick={() =>
              setMenuMovilAbierto(false)
            }
          >

            <span>01</span>

            Inicio

          </Link>


          {/* PROPIEDADES */}

          <Link
            to="/inmuebles"
            className={
              esPropiedades
                ? 'hl-mobile-menu-activo'
                : ''
            }
            onClick={() =>
              setMenuMovilAbierto(false)
            }
          >

            <span>02</span>

            Propiedades

          </Link>


          {/* PUBLICAR */}

          {usuario && (

            <Link
              to="/publicar"
              className={
                esPublicar
                  ? 'hl-mobile-menu-activo'
                  : ''
              }
              onClick={() =>
                setMenuMovilAbierto(false)
              }
            >

              <span>03</span>

              Publicar propiedad

            </Link>

          )}


          {/* NOSOTROS */}

          <a
            href="/#nosotros"
            onClick={() =>
              setMenuMovilAbierto(false)
            }
          >

            <span>
              {usuario ? '04' : '03'}
            </span>

            Nosotros

          </a>


          {/* CONTACTO */}

          <a
            href="/#contacto"
            onClick={() =>
              setMenuMovilAbierto(false)
            }
          >

            <span>
              {usuario ? '05' : '04'}
            </span>

            Contacto

          </a>


        </div>

      )}


    </header>

  )

}


export default Navbar