import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  obtenerToken,
  obtenerUsuarioGuardado,
  cerrarSesionLocal,
} from '../services/auth'


function Dashboard() {

  const navigate = useNavigate()

  const usuarioGuardado =
    obtenerUsuarioGuardado()

  const [usuarioActual, setUsuarioActual] =
    useState(usuarioGuardado)

  const [editandoPerfil, setEditandoPerfil] =
    useState(false)

  const [guardandoPerfil, setGuardandoPerfil] =
    useState(false)

  const [errorPerfil, setErrorPerfil] =
    useState('')

  const [formularioPerfil, setFormularioPerfil] =
    useState({
      name:
        usuarioGuardado?.name ||
        usuarioGuardado?.nombre ||
        '',
      email:
        usuarioGuardado?.email ||
        '',
    })


  /* ======================================================
     SEGURIDAD / CONTRASEÑA
  ====================================================== */

  const [editandoPassword, setEditandoPassword] =
    useState(false)

  const [guardandoPassword, setGuardandoPassword] =
    useState(false)

  const [errorPassword, setErrorPassword] =
    useState('')

  const [mostrarPasswords, setMostrarPasswords] =
    useState(false)

  const [formularioPassword, setFormularioPassword] =
    useState({
      password_actual: '',
      password: '',
      password_confirmation: '',
    })


  /* ======================================================
     ELIMINAR CUENTA
  ====================================================== */

  const [modalEliminarCuenta, setModalEliminarCuenta] =
    useState(false)

  const [passwordEliminarCuenta, setPasswordEliminarCuenta] =
    useState('')

  const [errorEliminarCuenta, setErrorEliminarCuenta] =
    useState('')

  const [eliminandoCuenta, setEliminandoCuenta] =
    useState(false)

  const [mostrarPasswordEliminar, setMostrarPasswordEliminar] =
    useState(false)


  /* ======================================================
     SECCIÓN ACTIVA
  ====================================================== */

  const [seccion, setSeccion] =
    useState('propiedades')


  /* ======================================================
     PROPIEDADES
  ====================================================== */

  const [inmuebles, setInmuebles] =
    useState([])

  const [cargando, setCargando] =
    useState(true)

  const [error, setError] =
    useState('')

  const [filtro, setFiltro] =
    useState('todas')


  /* ======================================================
     WHATSAPP
  ====================================================== */

  function obtenerEnlaceWhatsApp(mensaje) {

    const numero =
      String(
        mensaje?.whatsapp || ''
      ).replace(/\D/g, '')

    if (!numero) {
      return null
    }

    const nombreInteresado =
      mensaje?.inquilino?.name ||
      'Usuario HomeLink'

    const propiedad =
      mensaje?.inmueble?.titulo ||
      'la propiedad'

    const texto =
      `Hola ${nombreInteresado}, soy ${nombreUsuario}. ` +
      `Te contacto por tu consulta sobre "${propiedad}" en HomeLink.`

    return (
      `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
    )

  }


  /* ======================================================
     ELIMINAR PROPIEDAD
  ====================================================== */

  const [
    inmuebleEliminar,
    setInmuebleEliminar,
  ] = useState(null)

  const [
    eliminando,
    setEliminando,
  ] = useState(false)


  /* ======================================================
     MENSAJES
  ====================================================== */

  const [mensajes, setMensajes] =
    useState([])

  const [
    cargandoMensajes,
    setCargandoMensajes,
  ] = useState(false)

  const [
    errorMensajes,
    setErrorMensajes,
  ] = useState('')

  const [
    mensajeSeleccionado,
    setMensajeSeleccionado,
  ] = useState(null)

  const [
    mensajeEliminar,
    setMensajeEliminar,
  ] = useState(null)

  const [
    eliminandoMensaje,
    setEliminandoMensaje,
  ] = useState(false)

  /* ======================================================
   FAVORITOS
====================================================== */

  const [favoritos, setFavoritos] =
    useState([])

  const [
    cargandoFavoritos,
    setCargandoFavoritos,
  ] = useState(false)

  const [
    errorFavoritos,
    setErrorFavoritos,
  ] = useState('')

  const [
    quitandoFavorito,
    setQuitandoFavorito,
  ] = useState(null)

  /* ======================================================
     NOTIFICACIÓN
  ====================================================== */

  const [
    mensajeAccion,
    setMensajeAccion,
  ] = useState('')


  /* ======================================================
     CARGA INICIAL
  ====================================================== */

  useEffect(() => {

    cargarUsuario()
    cargarInmuebles()
    cargarMensajes()
    cargarFavoritos()

  }, [])



  /* ======================================================
     CARGAR USUARIO ACTUAL
  ====================================================== */

  async function cargarUsuario() {

    try {

      const token =
        obtenerToken()

      const respuesta =
        await fetch(
          '/api/user',
          {
            headers: {
              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },
          }
        )

      if (!respuesta.ok) {
        return
      }

      const datos =
        await respuesta.json()

      setUsuarioActual(datos)

      setFormularioPerfil({
        name:
          datos?.name ||
          datos?.nombre ||
          '',
        email:
          datos?.email ||
          '',
      })

    } catch (error) {

      console.error(error)

    }

  }


  /* ======================================================
     EDITAR PERFIL
  ====================================================== */

  function iniciarEdicionPerfil() {

    setFormularioPerfil({
      name:
        usuarioActual?.name ||
        usuarioActual?.nombre ||
        '',
      email:
        usuarioActual?.email ||
        '',
    })

    setErrorPerfil('')
    setEditandoPerfil(true)

  }


  function cancelarEdicionPerfil() {

    setFormularioPerfil({
      name:
        usuarioActual?.name ||
        usuarioActual?.nombre ||
        '',
      email:
        usuarioActual?.email ||
        '',
    })

    setErrorPerfil('')
    setEditandoPerfil(false)

  }


  function cambiarCampoPerfil(evento) {

    const {
      name,
      value,
    } = evento.target

    setFormularioPerfil(
      (anterior) => ({
        ...anterior,
        [name]: value,
      })
    )

  }


  async function guardarPerfil(evento) {

    evento.preventDefault()

    const nombre =
      formularioPerfil.name.trim()

    const correo =
      formularioPerfil.email.trim()

    if (!nombre || !correo) {

      setErrorPerfil(
        'Completa tu nombre y correo electrónico.'
      )

      return
    }

    try {

      setGuardandoPerfil(true)
      setErrorPerfil('')

      const token =
        obtenerToken()

      const respuesta =
        await fetch(
          '/api/perfil',
          {
            method: 'PUT',

            headers: {
              Accept:
                'application/json',
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              name: nombre,
              email: correo,
            }),
          }
        )

      let resultado = {}

      try {
        resultado =
          await respuesta.json()
      } catch {
        resultado = {}
      }

      if (!respuesta.ok) {

        const primerError =
          resultado?.errors
            ? Object.values(
              resultado.errors
            )?.[0]?.[0]
            : null

        throw new Error(
          primerError ||
          resultado?.message ||
          resultado?.mensaje ||
          'No fue posible actualizar el perfil.'
        )

      }

      const usuarioActualizado =
        resultado.usuario ||
        resultado.user

      if (usuarioActualizado) {
        setUsuarioActual(
          usuarioActualizado
        )
      }

      setEditandoPerfil(false)

      mostrarNotificacion(
        resultado.mensaje ||
        'Perfil actualizado correctamente.'
      )

      await cargarUsuario()

    } catch (error) {

      console.error(error)

      setErrorPerfil(
        error.message ||
        'No fue posible actualizar el perfil.'
      )

    } finally {

      setGuardandoPerfil(false)

    }

  }


  /* ======================================================
     CAMBIAR CONTRASEÑA
  ====================================================== */

  function iniciarCambioPassword() {

    setFormularioPassword({
      password_actual: '',
      password: '',
      password_confirmation: '',
    })

    setErrorPassword('')
    setMostrarPasswords(false)
    setEditandoPassword(true)

  }


  function cancelarCambioPassword() {

    setFormularioPassword({
      password_actual: '',
      password: '',
      password_confirmation: '',
    })

    setErrorPassword('')
    setMostrarPasswords(false)
    setEditandoPassword(false)

  }


  function cambiarCampoPassword(evento) {

    const {
      name,
      value,
    } = evento.target

    setFormularioPassword(
      (anterior) => ({
        ...anterior,
        [name]: value,
      })
    )

  }


  async function guardarPassword(evento) {

    evento.preventDefault()

    const actual =
      formularioPassword.password_actual

    const nueva =
      formularioPassword.password

    const confirmacion =
      formularioPassword.password_confirmation

    if (!actual || !nueva || !confirmacion) {

      setErrorPassword(
        'Completa los tres campos de contraseña.'
      )

      return
    }

    if (nueva.length < 8) {

      setErrorPassword(
        'La nueva contraseña debe tener al menos 8 caracteres.'
      )

      return
    }

    if (nueva !== confirmacion) {

      setErrorPassword(
        'La confirmación no coincide con la nueva contraseña.'
      )

      return
    }

    if (actual === nueva) {

      setErrorPassword(
        'La nueva contraseña debe ser diferente a la actual.'
      )

      return
    }

    try {

      setGuardandoPassword(true)
      setErrorPassword('')

      const token =
        obtenerToken()

      const respuesta =
        await fetch(
          '/api/perfil/password',
          {
            method: 'PUT',

            headers: {
              Accept:
                'application/json',
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              password_actual:
                actual,
              password:
                nueva,
              password_confirmation:
                confirmacion,
            }),
          }
        )

      let resultado = {}

      try {
        resultado =
          await respuesta.json()
      } catch {
        resultado = {}
      }

      if (!respuesta.ok) {

        const primerError =
          resultado?.errors
            ? Object.values(
              resultado.errors
            )?.[0]?.[0]
            : null

        throw new Error(
          primerError ||
          resultado?.mensaje ||
          resultado?.message ||
          'No fue posible cambiar la contraseña.'
        )

      }

      setFormularioPassword({
        password_actual: '',
        password: '',
        password_confirmation: '',
      })

      setMostrarPasswords(false)
      setEditandoPassword(false)

      mostrarNotificacion(
        resultado?.mensaje ||
        'Contraseña actualizada correctamente.'
      )

    } catch (error) {

      console.error(error)

      setErrorPassword(
        error.message ||
        'No fue posible cambiar la contraseña.'
      )

    } finally {

      setGuardandoPassword(false)

    }

  }


  /* ======================================================
     ELIMINAR CUENTA
  ====================================================== */

  function abrirEliminarCuenta() {

    setPasswordEliminarCuenta('')
    setErrorEliminarCuenta('')
    setMostrarPasswordEliminar(false)
    setModalEliminarCuenta(true)

  }


  function cerrarEliminarCuenta() {

    if (eliminandoCuenta) {
      return
    }

    setModalEliminarCuenta(false)
    setPasswordEliminarCuenta('')
    setErrorEliminarCuenta('')
    setMostrarPasswordEliminar(false)

  }


  async function eliminarCuenta(evento) {

    evento.preventDefault()

    if (!passwordEliminarCuenta) {

      setErrorEliminarCuenta(
        'Escribe tu contraseña actual para continuar.'
      )

      return
    }

    try {

      setEliminandoCuenta(true)
      setErrorEliminarCuenta('')

      const token =
        obtenerToken()

      const respuesta =
        await fetch(
          '/api/perfil',
          {
            method: 'DELETE',

            headers: {
              Accept:
                'application/json',
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              password:
                passwordEliminarCuenta,
            }),
          }
        )

      let resultado = {}

      try {

        resultado =
          await respuesta.json()

      } catch {

        resultado = {}

      }

      if (!respuesta.ok) {

        const primerError =
          resultado?.errors
            ? Object.values(
              resultado.errors
            )?.[0]?.[0]
            : null

        throw new Error(
          primerError ||
          resultado?.mensaje ||
          resultado?.message ||
          'No fue posible eliminar la cuenta.'
        )

      }

      cerrarSesionLocal()

      window.dispatchEvent(
        new Event('usuarioActualizado')
      )

      setUsuarioActual(null)
      setModalEliminarCuenta(false)

      navigate('/', {
        replace: true,
      })

    } catch (error) {

      console.error(error)

      setErrorEliminarCuenta(
        error.message ||
        'No fue posible eliminar la cuenta.'
      )

    } finally {

      setEliminandoCuenta(false)

    }

  }


  /* ======================================================
     CARGAR PROPIEDADES
  ====================================================== */

  async function cargarInmuebles() {

    try {

      setCargando(true)
      setError('')

      const token =
        obtenerToken()

      const respuesta =
        await fetch(
          '/api/mis-inmuebles',
          {
            headers: {
              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },
          }
        )

      if (!respuesta.ok) {

        throw new Error(
          'No fue posible cargar tus propiedades.'
        )

      }

      const datos =
        await respuesta.json()

      setInmuebles(
        Array.isArray(datos)
          ? datos
          : []
      )

    } catch (error) {

      console.error(error)

      setError(
        'No pudimos cargar tus propiedades.'
      )

    } finally {

      setCargando(false)

    }

  }


  /* ======================================================
     CARGAR MENSAJES
  ====================================================== */

  async function cargarMensajes() {

    try {

      setCargandoMensajes(true)
      setErrorMensajes('')

      const token =
        obtenerToken()

      const respuesta =
        await fetch(
          '/api/mensajes/recibidos',
          {
            headers: {
              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },
          }
        )

      if (!respuesta.ok) {

        throw new Error(
          'No fue posible cargar tus mensajes.'
        )

      }

      const datos =
        await respuesta.json()

      setMensajes(
        Array.isArray(datos)
          ? datos
          : []
      )

    } catch (error) {

      console.error(error)

      setErrorMensajes(
        'No pudimos cargar tus mensajes.'
      )

    } finally {

      setCargandoMensajes(false)

    }

  }
  /* ======================================================
     CARGAR FAVORITOS
  ====================================================== */

  async function cargarFavoritos() {

    try {

      setCargandoFavoritos(true)
      setErrorFavoritos('')

      const token =
        obtenerToken()

      const respuesta =
        await fetch(
          '/api/favoritos',
          {
            headers: {
              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },
          }
        )

      if (!respuesta.ok) {

        throw new Error(
          'No fue posible cargar tus favoritos.'
        )

      }

      const datos =
        await respuesta.json()

      setFavoritos(
        Array.isArray(datos)
          ? datos
          : []
      )

    } catch (error) {

      console.error(error)

      setErrorFavoritos(
        'No pudimos cargar tus propiedades favoritas.'
      )

    } finally {

      setCargandoFavoritos(false)

    }

  }


  /* ======================================================
     QUITAR DE FAVORITOS
  ====================================================== */

  async function quitarFavorito(
    inmuebleId
  ) {

    try {

      setQuitandoFavorito(
        inmuebleId
      )

      const token =
        obtenerToken()

      const respuesta =
        await fetch(
          `/api/inmuebles/${inmuebleId}/favorito`,
          {
            method: 'DELETE',

            headers: {
              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },
          }
        )

      let resultado = {}

      try {

        resultado =
          await respuesta.json()

      } catch {

        resultado = {}

      }

      if (!respuesta.ok) {

        throw new Error(
          resultado.mensaje ||
          'No fue posible quitar la propiedad de favoritos.'
        )

      }

      setFavoritos(
        (anteriores) =>
          anteriores.filter(
            (favorito) =>
              Number(
                favorito.inmueble_id
              ) !==
              Number(
                inmuebleId
              )
          )
      )

      mostrarNotificacion(
        'La propiedad fue eliminada de favoritos.'
      )

    } catch (error) {

      console.error(error)

      mostrarNotificacion(
        error.message ||
        'No fue posible actualizar tus favoritos.'
      )

    } finally {

      setQuitandoFavorito(null)

    }

  }

  /* ======================================================
     ESTADÍSTICAS
  ====================================================== */

  const resumen =
    useMemo(() => {

      const total =
        inmuebles.length

      const disponibles =
        inmuebles.filter(
          (inmueble) =>
            inmueble.estado ===
            'disponible'
        ).length

      const alquilados =
        inmuebles.filter(
          (inmueble) =>
            inmueble.estado ===
            'alquilado'
        ).length

      return {
        total,
        disponibles,
        alquilados,
      }

    }, [inmuebles])


  /* ======================================================
     MENSAJES NUEVOS
  ====================================================== */

  const mensajesNuevos =
    useMemo(() => {

      return mensajes.filter(
        (mensaje) =>
          mensaje.estado === 'nuevo'
      ).length

    }, [mensajes])


  /* ======================================================
     FILTROS
  ====================================================== */

  const inmueblesFiltrados =
    useMemo(() => {

      if (
        filtro ===
        'disponibles'
      ) {

        return inmuebles.filter(
          (inmueble) =>
            inmueble.estado ===
            'disponible'
        )

      }

      if (
        filtro ===
        'alquilados'
      ) {

        return inmuebles.filter(
          (inmueble) =>
            inmueble.estado ===
            'alquilado'
        )

      }

      return inmuebles

    }, [inmuebles, filtro])


  /* ======================================================
     IMAGEN PRINCIPAL
  ====================================================== */

  function obtenerImagenPrincipal(
    inmueble
  ) {

    if (
      !inmueble?.imagenes ||
      inmueble.imagenes.length === 0
    ) {
      return null
    }

    const principal =
      inmueble.imagenes.find(
        (imagen) =>
          Boolean(
            imagen.es_principal
          )
      ) ||
      inmueble.imagenes[0]

    return (
      principal?.url_imagen ||
      null
    )

  }


  /* ======================================================
     PRECIO
  ====================================================== */

  function formatearPrecio(precio) {

    const numero =
      Number(precio)

    if (
      Number.isNaN(numero)
    ) {
      return precio
    }

    return new Intl.NumberFormat(
      'en-US',
      {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    ).format(numero)

  }


  /* ======================================================
     FECHA
  ====================================================== */

  function formatearFecha(fecha) {

    if (!fecha) {
      return ''
    }

    const valor =
      new Date(fecha)

    if (
      Number.isNaN(
        valor.getTime()
      )
    ) {
      return ''
    }

    return new Intl.DateTimeFormat(
      'es-NI',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    ).format(valor)

  }


  /* ======================================================
     INICIALES
  ====================================================== */

  function obtenerIniciales(nombre) {

    if (!nombre) {
      return 'HL'
    }

    const partes =
      nombre
        .trim()
        .split(' ')
        .filter(Boolean)

    if (
      partes.length === 1
    ) {

      return partes[0][0]
        .toUpperCase()

    }

    return (
      partes[0][0] +
      partes[1][0]
    ).toUpperCase()

  }


  /* ======================================================
     ELIMINAR PROPIEDAD
  ====================================================== */

  async function eliminarInmueble() {

    if (!inmuebleEliminar) {
      return
    }

    try {

      setEliminando(true)
      setMensajeAccion('')

      const token =
        obtenerToken()

      const respuesta =
        await fetch(
          `/api/inmuebles/${inmuebleEliminar.id}`,
          {
            method: 'DELETE',

            headers: {
              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },
          }
        )

      const resultado =
        await respuesta.json()

      if (!respuesta.ok) {

        throw new Error(
          resultado.mensaje ||
          'No fue posible eliminar la propiedad.'
        )

      }

      setInmuebles(
        (anteriores) =>
          anteriores.filter(
            (inmueble) =>
              inmueble.id !==
              inmuebleEliminar.id
          )
      )

      setInmuebleEliminar(null)

      mostrarNotificacion(
        'La propiedad fue eliminada correctamente.'
      )

    } catch (error) {

      console.error(error)

      mostrarNotificacion(
        error.message ||
        'No fue posible eliminar la propiedad.'
      )

    } finally {

      setEliminando(false)

    }

  }


  /* ======================================================
     ABRIR MENSAJE
  ====================================================== */

  async function abrirMensaje(
    mensaje
  ) {

    setMensajeSeleccionado(
      mensaje
    )

    if (
      mensaje.estado !==
      'nuevo'
    ) {
      return
    }

    try {

      const token =
        obtenerToken()

      const respuesta =
        await fetch(
          `/api/mensajes/${mensaje.id}/leido`,
          {
            method: 'PATCH',

            headers: {
              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },
          }
        )

      if (!respuesta.ok) {
        return
      }

      setMensajes(
        (anteriores) =>
          anteriores.map(
            (item) =>
              item.id ===
                mensaje.id
                ? {
                  ...item,
                  estado: 'leido',
                }
                : item
          )
      )

      setMensajeSeleccionado(
        (actual) =>
          actual
            ? {
              ...actual,
              estado: 'leido',
            }
            : actual
      )

    } catch (error) {

      console.error(error)

    }

  }


  /* ======================================================
     ELIMINAR MENSAJE
  ====================================================== */

  async function eliminarMensaje() {

    if (!mensajeEliminar) {
      return
    }

    try {

      setEliminandoMensaje(true)

      const token =
        obtenerToken()

      const respuesta =
        await fetch(
          `/api/mensajes/${mensajeEliminar.id}`,
          {
            method: 'DELETE',

            headers: {
              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },
          }
        )

      const resultado =
        await respuesta.json()

      if (!respuesta.ok) {

        throw new Error(
          resultado.mensaje ||
          'No fue posible eliminar el mensaje.'
        )

      }

      setMensajes(
        (anteriores) =>
          anteriores.filter(
            (mensaje) =>
              mensaje.id !==
              mensajeEliminar.id
          )
      )

      if (
        mensajeSeleccionado?.id ===
        mensajeEliminar.id
      ) {

        setMensajeSeleccionado(
          null
        )

      }

      setMensajeEliminar(null)

      mostrarNotificacion(
        'El mensaje fue eliminado.'
      )

    } catch (error) {

      console.error(error)

      mostrarNotificacion(
        error.message ||
        'No fue posible eliminar el mensaje.'
      )

    } finally {

      setEliminandoMensaje(false)

    }

  }


  /* ======================================================
     NOTIFICACIÓN
  ====================================================== */

  function mostrarNotificacion(
    texto
  ) {

    setMensajeAccion(texto)

    setTimeout(() => {

      setMensajeAccion('')

    }, 3500)

  }


  /* ======================================================
     DATOS USUARIO
  ====================================================== */

  const nombreUsuario =
    usuarioActual?.name ||
    usuarioActual?.nombre ||
    'Usuario HomeLink'

  const primerNombre =
    nombreUsuario
      .split(' ')[0]


  return (

    <main className="dashboard-pagina">

      <section className="dashboard-wrapper">


        {/* IDENTIFICADOR */}

        <div className="dashboard-topline">

          <span>
            HOMELINK
          </span>

          <span>
            MI ESPACIO HOMELINK — 2026
          </span>

        </div>


        <div className="dashboard-panel">


          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="dashboard-sidebar">


            <div className="dashboard-perfil">

              <div className="dashboard-avatar">

                {obtenerIniciales(
                  nombreUsuario
                )}

              </div>

              <div>

                <strong>
                  {nombreUsuario}
                </strong>

                <span>
                  Cuenta HomeLink
                </span>

              </div>

            </div>


            <div className="dashboard-sidebar-linea" />


            <nav className="dashboard-menu">


              <Link to="/">

                <span className="dashboard-menu-icono">
                  ⌂
                </span>

                Inicio

              </Link>


              <button
                type="button"
                className={
                  seccion ===
                    'propiedades'
                    ? 'activo'
                    : ''
                }
                onClick={() =>
                  setSeccion(
                    'propiedades'
                  )
                }
              >

                <span className="dashboard-menu-icono">
                  ◇
                </span>

                Mis propiedades

              </button>


              <button
                type="button"
                className={
                  seccion ===
                    'mensajes'
                    ? 'activo'
                    : ''
                }
                onClick={() => {

                  setSeccion(
                    'mensajes'
                  )

                  cargarMensajes()

                }}
              >

                <span className="dashboard-menu-icono">
                  □
                </span>

                Mensajes

                {mensajesNuevos > 0 && (

                  <span className="dashboard-mensajes-contador">

                    {mensajesNuevos > 99
                      ? '99+'
                      : mensajesNuevos}

                  </span>

                )}

              </button>


              <button
                type="button"
                className={
                  seccion ===
                    'favoritos'
                    ? 'activo'
                    : ''
                }
                onClick={() => {

                  setSeccion(
                    'favoritos'
                  )

                  cargarFavoritos()

                }}
              >

                <span className="dashboard-menu-icono">
                  ♡
                </span>

                Favoritos

              </button>


              <button
                type="button"
                className={
                  seccion ===
                    'perfil'
                    ? 'activo'
                    : ''
                }
                onClick={() =>
                  setSeccion(
                    'perfil'
                  )
                }
              >

                <span className="dashboard-menu-icono">
                  ○
                </span>

                Mi perfil

              </button>


              <button
                type="button"
                className={
                  seccion ===
                    'configuracion'
                    ? 'activo'
                    : ''
                }
                onClick={() =>
                  setSeccion(
                    'configuracion'
                  )
                }
              >

                <span className="dashboard-menu-icono">
                  ⚙
                </span>

                Configuración

              </button>


            </nav>


            <div className="dashboard-sidebar-marca">

              <span>
                HL
              </span>

              <p>
                Tu espacio.
                <br />
                Tu espacio HomeLink.
              </p>

            </div>


          </aside>



          {/* =================================================
              CONTENIDO
          ================================================= */}

          <div className="dashboard-main">


            {/* =================================================
                MIS PROPIEDADES
            ================================================= */}

            {seccion ===
              'propiedades' && (

                <>

                  <header className="dashboard-header">

                    <div>

                      <span className="dashboard-eyebrow">
                        MI PORTAFOLIO
                      </span>

                      <h1>
                        Mis propiedades
                        <span>.</span>
                      </h1>

                      <p>
                        Bienvenida, {primerNombre}.
                        Administra tus propiedades,
                        revisa su disponibilidad y
                        mantén actualizado tu portafolio
                        desde un solo lugar.
                      </p>

                    </div>


                    <Link
                      to="/publicar"
                      className="dashboard-nueva"
                    >

                      <span>
                        +
                      </span>

                      Nueva propiedad

                    </Link>

                  </header>


                  {/* RESUMEN */}

                  <section className="dashboard-resumen">

                    <article>

                      <strong>
                        {String(
                          resumen.total
                        ).padStart(
                          2,
                          '0'
                        )}
                      </strong>

                      <div>

                        <span>
                          PORTAFOLIO
                        </span>

                        <p>
                          Propiedades publicadas
                        </p>

                      </div>

                    </article>


                    <article>

                      <strong>
                        {String(
                          resumen.disponibles
                        ).padStart(
                          2,
                          '0'
                        )}
                      </strong>

                      <div>

                        <span>
                          DISPONIBILIDAD
                        </span>

                        <p>
                          Disponibles
                        </p>

                      </div>

                    </article>


                    <article>

                      <strong>
                        {String(
                          resumen.alquilados
                        ).padStart(
                          2,
                          '0'
                        )}
                      </strong>

                      <div>

                        <span>
                          ESTADO
                        </span>

                        <p>
                          Alquiladas
                        </p>

                      </div>

                    </article>

                  </section>


                  {/* FILTROS */}

                  <div className="dashboard-filtros">

                    <button
                      type="button"
                      className={
                        filtro === 'todas'
                          ? 'activo'
                          : ''
                      }
                      onClick={() =>
                        setFiltro(
                          'todas'
                        )
                      }
                    >

                      Todas

                      <span>
                        {resumen.total}
                      </span>

                    </button>


                    <button
                      type="button"
                      className={
                        filtro ===
                          'disponibles'
                          ? 'activo'
                          : ''
                      }
                      onClick={() =>
                        setFiltro(
                          'disponibles'
                        )
                      }
                    >

                      Disponibles

                      <span>
                        {resumen.disponibles}
                      </span>

                    </button>


                    <button
                      type="button"
                      className={
                        filtro ===
                          'alquilados'
                          ? 'activo'
                          : ''
                      }
                      onClick={() =>
                        setFiltro(
                          'alquilados'
                        )
                      }
                    >

                      Alquiladas

                      <span>
                        {resumen.alquilados}
                      </span>

                    </button>

                  </div>


                  {/* CARGANDO */}

                  {cargando && (

                    <div className="dashboard-estado-pagina">

                      <span>
                        HOMELINK
                      </span>

                      <h3>
                        Preparando tu portafolio...
                      </h3>

                    </div>

                  )}


                  {/* ERROR */}

                  {!cargando &&
                    error && (

                      <div className="dashboard-estado-pagina">

                        <span>
                          HOMELINK
                        </span>

                        <h3>
                          No pudimos cargar tus propiedades.
                        </h3>

                        <p>
                          {error}
                        </p>

                        <button
                          type="button"
                          onClick={
                            cargarInmuebles
                          }
                        >
                          Intentar nuevamente
                        </button>

                      </div>

                    )}


                  {/* VACÍO */}

                  {!cargando &&
                    !error &&
                    inmueblesFiltrados.length ===
                    0 && (

                      <div className="dashboard-vacio">

                        <span className="dashboard-vacio-numero">
                          00
                        </span>

                        <div>

                          <span>
                            TU PORTAFOLIO COMIENZA AQUÍ
                          </span>

                          <h2>
                            No hay propiedades
                            <br />
                            en esta sección.
                          </h2>

                          <p>
                            Puedes publicar un nuevo
                            inmueble y administrarlo
                            directamente desde este
                            espacio.
                          </p>

                          <Link to="/publicar">

                            Publicar propiedad

                            <span>
                              →
                            </span>

                          </Link>

                        </div>

                      </div>

                    )}


                  {/* PROPIEDADES */}

                  {!cargando &&
                    !error &&
                    inmueblesFiltrados.length >
                    0 && (

                      <div className="dashboard-propiedades">

                        {inmueblesFiltrados.map(
                          (
                            inmueble,
                            indice
                          ) => {

                            const imagen =
                              obtenerImagenPrincipal(
                                inmueble
                              )

                            return (

                              <article
                                className="dashboard-propiedad"
                                key={inmueble.id}
                              >

                                <div className="dashboard-propiedad-numero">

                                  {String(
                                    indice + 1
                                  ).padStart(
                                    2,
                                    '0'
                                  )}

                                </div>


                                <div className="dashboard-propiedad-imagen">

                                  {imagen ? (

                                    <img
                                      src={imagen}
                                      alt={
                                        inmueble.titulo
                                      }
                                    />

                                  ) : (

                                    <div className="dashboard-sin-imagen">

                                      <strong>
                                        HL
                                      </strong>

                                      <span>
                                        HOMELINK
                                      </span>

                                    </div>

                                  )}

                                </div>


                                <div className="dashboard-propiedad-info">

                                  <div className="dashboard-propiedad-superior">

                                    <span className="dashboard-tipo">

                                      {inmueble.tipo_vivienda ||
                                        'PROPIEDAD'}

                                    </span>


                                    <span
                                      className={
                                        `dashboard-badge ${inmueble.estado ===
                                          'disponible'
                                          ? 'disponible'
                                          : 'alquilado'
                                        }`
                                      }
                                    >

                                      {inmueble.estado}

                                    </span>

                                  </div>


                                  <h2>
                                    {inmueble.titulo}
                                  </h2>


                                  <p className="dashboard-direccion">
                                    {inmueble.direccion}
                                  </p>


                                  <div className="dashboard-datos">

                                    <span>

                                      <strong>
                                        {inmueble.habitaciones}
                                      </strong>

                                      Hab.

                                    </span>


                                    <span>

                                      <strong>
                                        {inmueble.banos}
                                      </strong>

                                      Baños

                                    </span>


                                    <span>

                                      <strong>
                                        {inmueble.area ||
                                          '—'}
                                      </strong>

                                      m²

                                    </span>

                                  </div>

                                </div>


                                <div className="dashboard-propiedad-lateral">

                                  <div className="dashboard-precio">

                                    <span>
                                      PRECIO
                                    </span>

                                    <strong>
                                      {formatearPrecio(
                                        inmueble.precio
                                      )}
                                    </strong>

                                    <small>
                                      / mes
                                    </small>

                                  </div>


                                  <div className="dashboard-acciones">

                                    <Link
                                      to={`/inmuebles/${inmueble.id}`}
                                    >
                                      Ver
                                      <span>
                                        ↗
                                      </span>
                                    </Link>


                                    <Link
                                      to={`/dashboard/inmuebles/${inmueble.id}/editar`}
                                    >
                                      Editar
                                    </Link>


                                    <button
                                      type="button"
                                      className="eliminar"
                                      onClick={() =>
                                        setInmuebleEliminar(
                                          inmueble
                                        )
                                      }
                                    >
                                      Eliminar
                                    </button>

                                  </div>

                                </div>

                              </article>

                            )

                          }
                        )}

                      </div>

                    )}

                </>

              )}



            {/* =================================================
                MENSAJES
            ================================================= */}

            {seccion ===
              'mensajes' && (

                <section className="dashboard-mensajes">


                  <header className="dashboard-header dashboard-mensajes-header">

                    <div>

                      <span className="dashboard-eyebrow">
                        BANDEJA PRIVADA
                      </span>

                      <h1>
                        Mensajes
                        <span>.</span>
                      </h1>

                      <p>
                        Revisa las consultas que
                        recibes sobre tus propiedades
                        publicadas en HomeLink.
                      </p>

                    </div>


                    <div className="dashboard-mensajes-resumen">

                      <strong>
                        {String(
                          mensajesNuevos
                        ).padStart(
                          2,
                          '0'
                        )}
                      </strong>

                      <span>
                        SIN LEER
                      </span>

                    </div>

                  </header>


                  <div className="dashboard-mensajes-linea" />


                  {cargandoMensajes && (

                    <div className="dashboard-estado-pagina">

                      <span>
                        HOMELINK
                      </span>

                      <h3>
                        Revisando tus mensajes...
                      </h3>

                    </div>

                  )}


                  {!cargandoMensajes &&
                    errorMensajes && (

                      <div className="dashboard-estado-pagina">

                        <span>
                          HOMELINK
                        </span>

                        <h3>
                          No pudimos cargar tus mensajes.
                        </h3>

                        <p>
                          {errorMensajes}
                        </p>

                        <button
                          type="button"
                          onClick={
                            cargarMensajes
                          }
                        >
                          Intentar nuevamente
                        </button>

                      </div>

                    )}


                  {!cargandoMensajes &&
                    !errorMensajes &&
                    mensajes.length ===
                    0 && (

                      <div className="dashboard-mensajes-vacio">

                        <span className="dashboard-mensajes-vacio-icono">
                          □
                        </span>

                        <span className="dashboard-eyebrow">
                          TU BANDEJA ESTÁ AL DÍA
                        </span>

                        <h2>
                          No tienes mensajes
                          <br />
                          por el momento.
                        </h2>

                        <p>
                          Cuando alguien consulte
                          una de tus propiedades,
                          su mensaje aparecerá aquí.
                        </p>

                      </div>

                    )}


                  {!cargandoMensajes &&
                    !errorMensajes &&
                    mensajes.length >
                    0 && (

                      <div className="dashboard-mensajes-lista">

                        {mensajes.map(
                          (
                            mensaje,
                            indice
                          ) => {

                            const nombre =
                              mensaje
                                ?.inquilino
                                ?.name ||
                              'Usuario HomeLink'

                            const propiedad =
                              mensaje
                                ?.inmueble
                                ?.titulo ||
                              'Propiedad'

                            return (

                              <article
                                key={
                                  mensaje.id
                                }
                                className={
                                  `dashboard-mensaje ${mensaje.estado ===
                                    'nuevo'
                                    ? 'nuevo'
                                    : ''
                                  }`
                                }
                              >


                                <div className="dashboard-mensaje-numero">

                                  {String(
                                    indice + 1
                                  ).padStart(
                                    2,
                                    '0'
                                  )}

                                </div>


                                <div className="dashboard-mensaje-avatar">

                                  {obtenerIniciales(
                                    nombre
                                  )}

                                </div>


                                <button
                                  type="button"
                                  className="dashboard-mensaje-contenido"
                                  onClick={() =>
                                    abrirMensaje(
                                      mensaje
                                    )
                                  }
                                >

                                  <div className="dashboard-mensaje-superior">

                                    <strong>
                                      {nombre}
                                    </strong>

                                    <span>
                                      {formatearFecha(
                                        mensaje.created_at
                                      )}
                                    </span>

                                  </div>


                                  <span className="dashboard-mensaje-propiedad">

                                    {propiedad}

                                  </span>


                                  <p>

                                    {mensaje.mensaje}

                                  </p>

                                </button>


                                <div className="dashboard-mensaje-lateral">

                                  {mensaje.estado ===
                                    'nuevo' && (

                                      <span className="dashboard-mensaje-punto" />

                                    )}


                                  <button
                                    type="button"
                                    className="dashboard-mensaje-ver"
                                    onClick={() =>
                                      abrirMensaje(
                                        mensaje
                                      )
                                    }
                                  >
                                    Ver
                                  </button>


                                  {obtenerEnlaceWhatsApp(
                                    mensaje
                                  ) && (

                                      <a
                                        className="dashboard-mensaje-whatsapp"
                                        href={obtenerEnlaceWhatsApp(
                                          mensaje
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        WhatsApp ↗
                                      </a>

                                    )}


                                  <button
                                    type="button"
                                    className="dashboard-mensaje-eliminar"
                                    onClick={() =>
                                      setMensajeEliminar(
                                        mensaje
                                      )
                                    }
                                  >
                                    Eliminar
                                  </button>

                                </div>


                              </article>

                            )

                          }
                        )}

                      </div>

                    )}


                </section>

              )}



            {/* =================================================
              FAVORITOS
          ================================================= */}

            {seccion ===
              'favoritos' && (

                <section className="dashboard-favoritos">

                  <header className="dashboard-header">

                    <div>

                      <span className="dashboard-eyebrow">
                        COLECCIÓN PERSONAL
                      </span>

                      <h1>
                        Favoritos
                        <span>.</span>
                      </h1>

                      <p>
                        Guarda las propiedades que más
                        te interesan y consúltalas cuando
                        quieras desde tu colección personal.
                      </p>

                    </div>


                    <div className="dashboard-favoritos-resumen">

                      <strong>

                        {String(
                          favoritos.length
                        ).padStart(
                          2,
                          '0'
                        )}

                      </strong>

                      <span>
                        GUARDADAS
                      </span>

                    </div>

                  </header>


                  <div className="dashboard-mensajes-linea" />


                  {/* CARGANDO */}

                  {cargandoFavoritos && (

                    <div className="dashboard-estado-pagina">

                      <span>
                        HOMELINK
                      </span>

                      <h3>
                        Preparando tus favoritos...
                      </h3>

                    </div>

                  )}


                  {/* ERROR */}

                  {!cargandoFavoritos &&
                    errorFavoritos && (

                      <div className="dashboard-estado-pagina">

                        <span>
                          HOMELINK
                        </span>

                        <h3>
                          No pudimos cargar tus favoritos.
                        </h3>

                        <p>
                          {errorFavoritos}
                        </p>

                        <button
                          type="button"
                          onClick={
                            cargarFavoritos
                          }
                        >
                          Intentar nuevamente
                        </button>

                      </div>

                    )}


                  {/* SIN FAVORITOS */}

                  {!cargandoFavoritos &&
                    !errorFavoritos &&
                    favoritos.length ===
                    0 && (

                      <div className="dashboard-mensajes-vacio">

                        <span className="dashboard-mensajes-vacio-icono">
                          ♡
                        </span>

                        <span className="dashboard-eyebrow">
                          TU COLECCIÓN COMIENZA AQUÍ
                        </span>

                        <h2>
                          Aún no tienes
                          <br />
                          propiedades favoritas.
                        </h2>

                        <p>
                          Explora HomeLink y guarda
                          las propiedades que más
                          te interesen.
                        </p>

                        <Link to="/inmuebles">
                          Explorar propiedades →
                        </Link>

                      </div>

                    )}


                  {/* PROPIEDADES FAVORITAS */}

                  {!cargandoFavoritos &&
                    !errorFavoritos &&
                    favoritos.length >
                    0 && (

                      <div className="dashboard-favoritos-grid">

                        {favoritos.map(
                          (favorito) => {

                            const inmueble =
                              favorito.inmueble

                            if (!inmueble) {
                              return null
                            }

                            const imagen =
                              obtenerImagenPrincipal(
                                inmueble
                              )

                            return (

                              <article
                                className="dashboard-favorito-card"
                                key={favorito.id}
                              >

                                <div className="dashboard-favorito-imagen">

                                  <Link
                                    to={`/inmuebles/${inmueble.id}`}
                                  >

                                    {imagen ? (

                                      <img
                                        src={imagen}
                                        alt={
                                          inmueble.titulo
                                        }
                                      />

                                    ) : (

                                      <div className="dashboard-sin-imagen">

                                        <strong>
                                          HL
                                        </strong>

                                        <span>
                                          HOMELINK
                                        </span>

                                      </div>

                                    )}

                                  </Link>


                                  <button
                                    type="button"
                                    className="dashboard-favorito-corazon"
                                    disabled={
                                      quitandoFavorito ===
                                      inmueble.id
                                    }
                                    onClick={() =>
                                      quitarFavorito(
                                        inmueble.id
                                      )
                                    }
                                    title="Quitar de favoritos"
                                  >

                                    {quitandoFavorito ===
                                      inmueble.id
                                      ? '·'
                                      : '♥'}

                                  </button>


                                  <span className="dashboard-favorito-estado">

                                    {inmueble.estado}

                                  </span>

                                </div>


                                <div className="dashboard-favorito-info">

                                  <span className="dashboard-eyebrow">

                                    {inmueble.tipo_vivienda ||
                                      'PROPIEDAD'}

                                  </span>


                                  <Link
                                    to={`/inmuebles/${inmueble.id}`}
                                    className="dashboard-favorito-titulo"
                                  >

                                    {inmueble.titulo}

                                  </Link>


                                  <p>
                                    {inmueble.direccion}
                                  </p>


                                  <div className="dashboard-favorito-datos">

                                    <span>

                                      <strong>
                                        {inmueble.habitaciones}
                                      </strong>

                                      {' '}hab.

                                    </span>


                                    <span>

                                      <strong>
                                        {inmueble.banos}
                                      </strong>

                                      {' '}baños

                                    </span>


                                    {inmueble.area && (

                                      <span>

                                        <strong>
                                          {inmueble.area}
                                        </strong>

                                        {' '}m²

                                      </span>

                                    )}

                                  </div>


                                  <div className="dashboard-favorito-pie">

                                    <div>

                                      <span>
                                        PRECIO
                                      </span>

                                      <strong>

                                        {formatearPrecio(
                                          inmueble.precio
                                        )}

                                      </strong>

                                      <small>
                                        / mes
                                      </small>

                                    </div>


                                    <Link
                                      to={`/inmuebles/${inmueble.id}`}
                                    >
                                      Ver propiedad ↗
                                    </Link>

                                  </div>

                                </div>

                              </article>

                            )

                          }
                        )}

                      </div>

                    )}

                </section>

              )}


            {/* =================================================
                MI PERFIL
            ================================================= */

              seccion ===
              'perfil' && (

                <section className="dashboard-perfil-seccion">

                  <header className="dashboard-header dashboard-perfil-header">

                    <div>

                      <span className="dashboard-eyebrow">
                        CUENTA HOMELINK
                      </span>

                      <h1>
                        Mi perfil
                        <span>.</span>
                      </h1>

                      <p>
                        Administra tus datos personales desde
                        una sola cuenta. Puedes explorar, guardar
                        propiedades y también publicar inmuebles.
                      </p>

                    </div>

                    {!editandoPerfil && (

                      <button
                        type="button"
                        className="dashboard-perfil-editar"
                        onClick={
                          iniciarEdicionPerfil
                        }
                      >
                        Editar perfil ↗
                      </button>

                    )}

                  </header>


                  <div className="dashboard-mensajes-linea" />


                  {!editandoPerfil ? (

                    <div className="dashboard-perfil-nuevo">

                      <div className="dashboard-perfil-identidad">

                        <div className="dashboard-perfil-grande">
                          {obtenerIniciales(
                            nombreUsuario
                          )}
                        </div>

                        <div>

                          <span className="dashboard-eyebrow">
                            PERFIL PERSONAL
                          </span>

                          <h2>
                            {nombreUsuario}
                          </h2>

                          <p>
                            {usuarioActual?.email ||
                              'Correo no disponible'}
                          </p>

                        </div>

                      </div>


                      <div className="dashboard-perfil-datos-grid">

                        <article>
                          <span>NOMBRE</span>
                          <strong>
                            {nombreUsuario}
                          </strong>
                        </article>

                        <article>
                          <span>CORREO</span>
                          <strong>
                            {usuarioActual?.email ||
                              'No disponible'}
                          </strong>
                        </article>

                        <article>
                          <span>CUENTA</span>
                          <strong>
                            Cuenta HomeLink
                          </strong>
                        </article>

                        <article>
                          <span>MODALIDAD</span>
                          <strong>
                            Buscar y publicar
                          </strong>
                        </article>

                      </div>


                      <div className="dashboard-perfil-capacidades">

                        <span className="dashboard-eyebrow">
                          TU CUENTA PUEDE
                        </span>

                        <div>

                          <article>
                            <span>01</span>
                            <strong>
                              Buscar propiedades
                            </strong>
                            <p>
                              Explora inmuebles disponibles y
                              consulta sus detalles.
                            </p>
                          </article>

                          <article>
                            <span>02</span>
                            <strong>
                              Guardar favoritos
                            </strong>
                            <p>
                              Conserva tus propiedades preferidas
                              dentro de tu colección.
                            </p>
                          </article>

                          <article>
                            <span>03</span>
                            <strong>
                              Publicar inmuebles
                            </strong>
                            <p>
                              Publica y administra tus propias
                              propiedades desde este panel.
                            </p>
                          </article>

                        </div>

                      </div>

                    </div>

                  ) : (

                    <form
                      className="dashboard-perfil-formulario"
                      onSubmit={
                        guardarPerfil
                      }
                    >

                      <div className="dashboard-perfil-formulario-cabecera">

                        <span className="dashboard-eyebrow">
                          EDITAR INFORMACIÓN
                        </span>

                        <h2>
                          Actualiza tus datos
                        </h2>

                        <p>
                          Los cambios se aplicarán a tu cuenta
                          HomeLink. Tu modalidad de uso seguirá
                          permitiendo buscar y publicar propiedades.
                        </p>

                      </div>


                      <div className="dashboard-perfil-campos">

                        <label>

                          <span>
                            NOMBRE COMPLETO
                          </span>

                          <input
                            type="text"
                            name="name"
                            value={
                              formularioPerfil.name
                            }
                            onChange={
                              cambiarCampoPerfil
                            }
                            maxLength={255}
                            autoComplete="name"
                            required
                          />

                        </label>


                        <label>

                          <span>
                            CORREO ELECTRÓNICO
                          </span>

                          <input
                            type="email"
                            name="email"
                            value={
                              formularioPerfil.email
                            }
                            onChange={
                              cambiarCampoPerfil
                            }
                            maxLength={255}
                            autoComplete="email"
                            required
                          />

                        </label>

                      </div>


                      {errorPerfil && (

                        <div className="dashboard-perfil-error">
                          {errorPerfil}
                        </div>

                      )}


                      <div className="dashboard-perfil-formulario-acciones">

                        <button
                          type="button"
                          className="cancelar"
                          disabled={
                            guardandoPerfil
                          }
                          onClick={
                            cancelarEdicionPerfil
                          }
                        >
                          Cancelar
                        </button>

                        <button
                          type="submit"
                          className="guardar"
                          disabled={
                            guardandoPerfil
                          }
                        >
                          {guardandoPerfil
                            ? 'Guardando...'
                            : 'Guardar cambios'}
                        </button>

                      </div>

                    </form>

                  )}

                </section>

              )}



            {/* =================================================
                CONFIGURACIÓN
            ================================================= */}

            {seccion ===
              'configuracion' && (

                <section className="dashboard-configuracion">

                  <header className="dashboard-header dashboard-configuracion-header">

                    <div>

                      <span className="dashboard-eyebrow">
                        CUENTA Y SEGURIDAD
                      </span>

                      <h1>
                        Configuración
                        <span>.</span>
                      </h1>

                      <p>
                        Administra la seguridad de tu cuenta
                        y accede a tus principales opciones
                        de HomeLink desde un solo lugar.
                      </p>

                    </div>

                    <div className="dashboard-configuracion-sello">
                      <span>HL</span>
                      <small>CUENTA PROTEGIDA</small>
                    </div>

                  </header>


                  <div className="dashboard-mensajes-linea" />


                  <div className="dashboard-configuracion-grid">

                    <article className="dashboard-configuracion-card">

                      <span className="dashboard-configuracion-numero">
                        01
                      </span>

                      <div className="dashboard-configuracion-card-contenido">

                        <span className="dashboard-eyebrow">
                          CUENTA
                        </span>

                        <h2>
                          Sesión activa
                        </h2>

                        <p>
                          Estás usando HomeLink como
                          <strong> {nombreUsuario}</strong>.
                        </p>

                        <div className="dashboard-configuracion-dato">
                          <span>CORREO</span>
                          <strong>
                            {usuarioActual?.email ||
                              'No disponible'}
                          </strong>
                        </div>

                      </div>

                      <span className="dashboard-configuracion-check">
                        ✓
                      </span>

                    </article>


                    <article className="dashboard-configuracion-card">

                      <span className="dashboard-configuracion-numero">
                        02
                      </span>

                      <div className="dashboard-configuracion-card-contenido">

                        <span className="dashboard-eyebrow">
                          PERFIL
                        </span>

                        <h2>
                          Información personal
                        </h2>

                        <p>
                          Actualiza tu nombre y correo
                          electrónico desde Mi perfil.
                        </p>

                        <button
                          type="button"
                          className="dashboard-configuracion-enlace"
                          onClick={() =>
                            setSeccion(
                              'perfil'
                            )
                          }
                        >
                          Ir a Mi perfil →
                        </button>

                      </div>

                    </article>


                    <article className="dashboard-configuracion-card dashboard-configuracion-seguridad">

                      <span className="dashboard-configuracion-numero">
                        03
                      </span>

                      <div className="dashboard-configuracion-card-contenido">

                        <span className="dashboard-eyebrow">
                          SEGURIDAD
                        </span>

                        <h2>
                          Contraseña
                        </h2>

                        <p>
                          Protege tu cuenta con una contraseña
                          segura y actualízala cuando lo necesites.
                        </p>

                        {!editandoPassword && (

                          <button
                            type="button"
                            className="dashboard-configuracion-enlace"
                            onClick={
                              iniciarCambioPassword
                            }
                          >
                            Cambiar contraseña →
                          </button>

                        )}

                      </div>

                      {!editandoPassword && (
                        <span className="dashboard-configuracion-candado">
                          ◇
                        </span>
                      )}

                    </article>

                  </div>


                  {editandoPassword && (

                    <form
                      className="dashboard-password-formulario"
                      onSubmit={
                        guardarPassword
                      }
                    >

                      <div className="dashboard-password-cabecera">

                        <div>

                          <span className="dashboard-eyebrow">
                            SEGURIDAD DE LA CUENTA
                          </span>

                          <h2>
                            Cambiar contraseña
                          </h2>

                          <p>
                            Confirma tu contraseña actual y
                            establece una nueva de al menos
                            8 caracteres.
                          </p>

                        </div>

                        <button
                          type="button"
                          className="dashboard-password-ver"
                          onClick={() =>
                            setMostrarPasswords(
                              (actual) => !actual
                            )
                          }
                        >
                          {mostrarPasswords
                            ? 'Ocultar contraseñas'
                            : 'Mostrar contraseñas'}
                        </button>

                      </div>


                      <div className="dashboard-password-campos">

                        <label>

                          <span>
                            CONTRASEÑA ACTUAL
                          </span>

                          <input
                            type={
                              mostrarPasswords
                                ? 'text'
                                : 'password'
                            }
                            name="password_actual"
                            value={
                              formularioPassword
                                .password_actual
                            }
                            onChange={
                              cambiarCampoPassword
                            }
                            autoComplete="current-password"
                            required
                          />

                        </label>


                        <label>

                          <span>
                            NUEVA CONTRASEÑA
                          </span>

                          <input
                            type={
                              mostrarPasswords
                                ? 'text'
                                : 'password'
                            }
                            name="password"
                            value={
                              formularioPassword
                                .password
                            }
                            onChange={
                              cambiarCampoPassword
                            }
                            minLength={8}
                            autoComplete="new-password"
                            required
                          />

                          <small>
                            Mínimo 8 caracteres.
                          </small>

                        </label>


                        <label>

                          <span>
                            CONFIRMAR NUEVA CONTRASEÑA
                          </span>

                          <input
                            type={
                              mostrarPasswords
                                ? 'text'
                                : 'password'
                            }
                            name="password_confirmation"
                            value={
                              formularioPassword
                                .password_confirmation
                            }
                            onChange={
                              cambiarCampoPassword
                            }
                            minLength={8}
                            autoComplete="new-password"
                            required
                          />

                        </label>

                      </div>


                      {errorPassword && (

                        <div className="dashboard-password-error">
                          {errorPassword}
                        </div>

                      )}


                      <div className="dashboard-password-acciones">

                        <button
                          type="button"
                          className="cancelar"
                          disabled={
                            guardandoPassword
                          }
                          onClick={
                            cancelarCambioPassword
                          }
                        >
                          Cancelar
                        </button>

                        <button
                          type="submit"
                          className="guardar"
                          disabled={
                            guardandoPassword
                          }
                        >
                          {guardandoPassword
                            ? 'Actualizando...'
                            : 'Actualizar contraseña'}
                        </button>

                      </div>

                    </form>

                  )}


                  {/* ZONA DE PELIGRO */}

                  <div className="dashboard-zona-peligro">

                    <div>

                      <span className="dashboard-eyebrow">
                        ZONA DE PELIGRO
                      </span>

                      <h2>
                        Eliminar cuenta
                      </h2>

                      <p>
                        Esta acción eliminará permanentemente
                        tu cuenta, tus propiedades publicadas,
                        fotografías, mensajes y favoritos.
                        No se puede deshacer.
                      </p>

                    </div>

                    <button
                      type="button"
                      className="dashboard-eliminar-cuenta"
                      onClick={
                        abrirEliminarCuenta
                      }
                    >
                      Eliminar mi cuenta
                    </button>

                  </div>


                  <div className="dashboard-configuracion-nota">

                    <span>
                      SEGURIDAD
                    </span>

                    <p>
                      HomeLink nunca mostrará tu contraseña.
                      Si la cambias, utiliza una combinación
                      que no uses en otros servicios.
                    </p>

                  </div>

                </section>

              )}


          </div>


        </div>

      </section>



      {/* =================================================
          MODAL ELIMINAR CUENTA
      ================================================= */}

      {modalEliminarCuenta && (

        <div
          className="dashboard-modal-fondo"
          onClick={
            cerrarEliminarCuenta
          }
        >

          <form
            className="dashboard-modal dashboard-modal-cuenta"
            onSubmit={
              eliminarCuenta
            }
            onClick={(evento) =>
              evento.stopPropagation()
            }
          >

            <button
              type="button"
              className="dashboard-modal-cerrar"
              disabled={
                eliminandoCuenta
              }
              onClick={
                cerrarEliminarCuenta
              }
            >
              ×
            </button>


            <span className="dashboard-modal-eyebrow">
              ELIMINAR CUENTA
            </span>


            <h2>
              ¿Eliminar tu cuenta
              <br />
              definitivamente?
            </h2>


            <p>
              Tu cuenta y la información asociada
              se eliminarán permanentemente de
              HomeLink. Esta acción no se puede
              deshacer.
            </p>


            <label className="dashboard-eliminar-cuenta-campo">

              <span>
                CONTRASEÑA ACTUAL
              </span>

              <div className="dashboard-eliminar-password">

                <input
                  type={
                    mostrarPasswordEliminar
                      ? 'text'
                      : 'password'
                  }
                  value={
                    passwordEliminarCuenta
                  }
                  onChange={(evento) => {

                    setPasswordEliminarCuenta(
                      evento.target.value
                    )

                    if (errorEliminarCuenta) {
                      setErrorEliminarCuenta('')
                    }

                  }}
                  autoComplete="current-password"
                  placeholder="Escribe tu contraseña"
                  disabled={
                    eliminandoCuenta
                  }
                  required
                />

                <button
                  type="button"
                  className="dashboard-eliminar-password-ojo"
                  onClick={() =>
                    setMostrarPasswordEliminar(
                      (actual) => !actual
                    )
                  }
                  disabled={eliminandoCuenta}
                  aria-label={
                    mostrarPasswordEliminar
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  title={
                    mostrarPasswordEliminar
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                >
                  {mostrarPasswordEliminar ? (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.8 10.8 0 0112 4c5.5 0 9 5 9 5a16.2 16.2 0 01-3.1 3.6M6.2 6.2C4.1 7.6 3 9 3 9s3.5 5 9 5c1 0 1.9-.2 2.7-.4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="2.3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                    </svg>
                  )}
                </button>

              </div>

            </label>


            {errorEliminarCuenta && (

              <div className="dashboard-password-error">
                {errorEliminarCuenta}
              </div>

            )}


            <div className="dashboard-modal-acciones">

              <button
                type="button"
                className="cancelar"
                disabled={
                  eliminandoCuenta
                }
                onClick={
                  cerrarEliminarCuenta
                }
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="confirmar"
                disabled={
                  eliminandoCuenta
                }
              >
                {eliminandoCuenta
                  ? 'Eliminando cuenta...'
                  : 'Eliminar definitivamente'}
              </button>

            </div>

          </form>

        </div>

      )}



      {/* =================================================
          NOTIFICACIÓN
      ================================================= */}

      {mensajeAccion && (

        <div className="dashboard-notificacion">

          <span>
            HOMELINK
          </span>

          <p>
            {mensajeAccion}
          </p>

        </div>

      )}



      {/* =================================================
          MODAL LEER MENSAJE
      ================================================= */}

      {mensajeSeleccionado && (

        <div
          className="dashboard-modal-fondo"
          onClick={() =>
            setMensajeSeleccionado(
              null
            )
          }
        >

          <div
            className="dashboard-mensaje-modal"
            onClick={(evento) =>
              evento.stopPropagation()
            }
          >

            <button
              type="button"
              className="dashboard-modal-cerrar"
              onClick={() =>
                setMensajeSeleccionado(
                  null
                )
              }
            >
              ×
            </button>


            <span className="dashboard-modal-eyebrow">
              CONSULTA RECIBIDA
            </span>


            <div className="dashboard-mensaje-modal-persona">

              <div>

                {obtenerIniciales(
                  mensajeSeleccionado
                    ?.inquilino
                    ?.name
                )}

              </div>

              <section>

                <span>
                  ENVIADO POR
                </span>

                <strong>
                  {mensajeSeleccionado
                    ?.inquilino
                    ?.name ||
                    'Usuario HomeLink'}
                </strong>

              </section>

            </div>


            <span className="dashboard-mensaje-modal-fecha">

              {formatearFecha(
                mensajeSeleccionado
                  .created_at
              )}

            </span>


            <h2>

              {mensajeSeleccionado
                ?.inmueble
                ?.titulo ||
                'Consulta de propiedad'}

            </h2>


            <div className="dashboard-mensaje-modal-texto">

              <span>
                MENSAJE
              </span>

              <p>
                {mensajeSeleccionado
                  .mensaje}
              </p>

            </div>


            <div className="dashboard-mensaje-modal-acciones">

              <Link
                to={`/inmuebles/${mensajeSeleccionado.inmueble_id}`}
              >
                Ver propiedad ↗
              </Link>


              {obtenerEnlaceWhatsApp(
                mensajeSeleccionado
              ) && (

                  <a
                    className="dashboard-mensaje-modal-whatsapp"
                    href={obtenerEnlaceWhatsApp(
                      mensajeSeleccionado
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contactar por WhatsApp ↗
                  </a>

                )}


              <button
                type="button"
                onClick={() => {

                  setMensajeSeleccionado(
                    null
                  )

                  setMensajeEliminar(
                    mensajeSeleccionado
                  )

                }}
              >
                Eliminar mensaje
              </button>

            </div>


          </div>

        </div>

      )}



      {/* =================================================
          MODAL ELIMINAR MENSAJE
      ================================================= */}

      {mensajeEliminar && (

        <div
          className="dashboard-modal-fondo"
          onClick={() => {

            if (
              !eliminandoMensaje
            ) {

              setMensajeEliminar(
                null
              )

            }

          }}
        >

          <div
            className="dashboard-modal"
            onClick={(evento) =>
              evento.stopPropagation()
            }
          >

            <button
              type="button"
              className="dashboard-modal-cerrar"
              disabled={
                eliminandoMensaje
              }
              onClick={() =>
                setMensajeEliminar(
                  null
                )
              }
            >
              ×
            </button>


            <span className="dashboard-modal-eyebrow">
              ELIMINAR MENSAJE
            </span>


            <h2>
              ¿Deseas eliminar
              <br />
              este mensaje?
            </h2>


            <p>

              <strong>
                {mensajeEliminar
                  ?.inquilino
                  ?.name ||
                  'Usuario HomeLink'}
              </strong>

              {' '}envió esta consulta sobre
              una de tus propiedades.
              Esta acción no se puede deshacer.

            </p>


            <div className="dashboard-modal-acciones">

              <button
                type="button"
                className="cancelar"
                disabled={
                  eliminandoMensaje
                }
                onClick={() =>
                  setMensajeEliminar(
                    null
                  )
                }
              >
                Conservar mensaje
              </button>


              <button
                type="button"
                className="confirmar"
                disabled={
                  eliminandoMensaje
                }
                onClick={
                  eliminarMensaje
                }
              >

                {eliminandoMensaje
                  ? 'Eliminando...'
                  : 'Sí, eliminar'}

              </button>

            </div>


          </div>

        </div>

      )}



      {/* =================================================
          MODAL ELIMINAR PROPIEDAD
      ================================================= */}

      {inmuebleEliminar && (

        <div
          className="dashboard-modal-fondo"
          onClick={() => {

            if (!eliminando) {

              setInmuebleEliminar(
                null
              )

            }

          }}
        >

          <div
            className="dashboard-modal"
            onClick={(evento) =>
              evento.stopPropagation()
            }
          >

            <button
              type="button"
              className="dashboard-modal-cerrar"
              disabled={eliminando}
              onClick={() =>
                setInmuebleEliminar(
                  null
                )
              }
            >
              ×
            </button>


            <span className="dashboard-modal-eyebrow">
              ELIMINAR PROPIEDAD
            </span>


            <span className="dashboard-modal-numero">

              {String(
                inmuebleEliminar.id
              ).padStart(
                2,
                '0'
              )}

            </span>


            <h2>
              ¿Deseas eliminar
              <br />
              esta propiedad?
            </h2>


            <p>

              <strong>
                {inmuebleEliminar.titulo}
              </strong>

              {' '}será eliminada de
              HomeLink junto con sus
              fotografías. Esta acción
              no se puede deshacer.

            </p>


            <div className="dashboard-modal-acciones">

              <button
                type="button"
                className="cancelar"
                disabled={eliminando}
                onClick={() =>
                  setInmuebleEliminar(
                    null
                  )
                }
              >
                Conservar propiedad
              </button>


              <button
                type="button"
                className="confirmar"
                disabled={eliminando}
                onClick={
                  eliminarInmueble
                }
              >

                {eliminando
                  ? 'Eliminando...'
                  : 'Sí, eliminar'}

              </button>

            </div>


          </div>

        </div>

      )}


    </main>

  )

}


export default Dashboard