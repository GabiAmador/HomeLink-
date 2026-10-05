import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import {
  obtenerToken,
  obtenerUsuarioGuardado,
} from '../services/auth'


/* =========================================
   ICONO DEL MAPA
========================================= */

const iconoUbicacion = L.icon({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})


function DetalleInmueble() {

  const { id } = useParams()


  /* =========================================
     ESTADOS GENERALES
  ========================================= */

  const [inmueble, setInmueble] =
    useState(null)

  const [cargando, setCargando] =
    useState(true)

  const [error, setError] =
    useState('')

  const [imagenActiva, setImagenActiva] =
    useState(0)

  const [galeriaAbierta, setGaleriaAbierta] =
    useState(false)


  /* =========================================
     ESTADOS DE CONTACTO
  ========================================= */

  const [contactoAbierto, setContactoAbierto] =
    useState(false)

  const [whatsappContacto, setWhatsappContacto] =
    useState('')

  const [mensajeContacto, setMensajeContacto] =
    useState('')

  const [enviandoMensaje, setEnviandoMensaje] =
    useState(false)

  const [errorMensaje, setErrorMensaje] =
    useState('')

  const [mensajeEnviado, setMensajeEnviado] =
    useState(false)


  /* =========================================
     USUARIO ACTUAL
  ========================================= */

  const usuarioActual =
    obtenerUsuarioGuardado()

  const token =
    obtenerToken()


  /* =========================================
     CARGAR PROPIEDAD
  ========================================= */

  useEffect(() => {

    setCargando(true)
    setError('')

    fetch(`/api/inmuebles/${id}`)

      .then((respuesta) => {

        if (!respuesta.ok) {

          throw new Error(
            'No se pudo cargar el inmueble'
          )

        }

        return respuesta.json()

      })

      .then((datos) => {

        setInmueble(datos)
        setImagenActiva(0)
        setCargando(false)

      })

      .catch((error) => {

        console.error(error)

        setError(
          'No se pudo cargar el inmueble.'
        )

        setCargando(false)

      })

  }, [id])


  /* =========================================
     OBTENER IMÁGENES
  ========================================= */

  const imagenes = useMemo(() => {

    if (!inmueble?.imagenes?.length) {
      return []
    }

    return inmueble.imagenes
      .map(
        (imagen) =>
          imagen.url_imagen
      )
      .filter(Boolean)

  }, [inmueble])


  /* =========================================
     GALERÍA
  ========================================= */

  function abrirGaleria(indice = 0) {

    setImagenActiva(indice)
    setGaleriaAbierta(true)

  }


  function cerrarGaleria() {

    setGaleriaAbierta(false)

  }


  function imagenAnterior() {

    setImagenActiva((actual) => {

      if (actual === 0) {
        return imagenes.length - 1
      }

      return actual - 1

    })

  }


  function imagenSiguiente() {

    setImagenActiva((actual) => {

      if (
        actual ===
        imagenes.length - 1
      ) {
        return 0
      }

      return actual + 1

    })

  }


  /* =========================================
     CONTACTO
  ========================================= */

  function abrirContacto() {

    setErrorMensaje('')
    setMensajeEnviado(false)
    setContactoAbierto(true)

  }


  function cerrarContacto() {

    if (enviandoMensaje) {
      return
    }

    setContactoAbierto(false)
    setErrorMensaje('')
    setMensajeEnviado(false)

  }


  /* =========================================
     ENVIAR CONSULTA
  ========================================= */

  async function enviarMensaje(evento) {

    evento.preventDefault()

    setErrorMensaje('')
    setMensajeEnviado(false)


    /* USUARIO SIN SESIÓN */

    if (
      !token ||
      !usuarioActual
    ) {

      setErrorMensaje(
        'Debes iniciar sesión para enviar una consulta.'
      )

      return

    }


    const whatsappLimpio =
      whatsappContacto.trim()

    const mensajeLimpio =
      mensajeContacto.trim()


    /* VALIDAR WHATSAPP */

    if (!whatsappLimpio) {

      setErrorMensaje(
        'Ingresa tu número de WhatsApp.'
      )

      return

    }


    const soloNumeros =
      whatsappLimpio.replace(
        /\D/g,
        ''
      )


    if (
      soloNumeros.length < 8 ||
      soloNumeros.length > 15
    ) {

      setErrorMensaje(
        'Ingresa un número de WhatsApp válido.'
      )

      return

    }


    /* VALIDAR MENSAJE */

    if (!mensajeLimpio) {

      setErrorMensaje(
        'Escribe un mensaje antes de enviarlo.'
      )

      return

    }


    if (
      mensajeLimpio.length < 3
    ) {

      setErrorMensaje(
        'El mensaje debe contener al menos 3 caracteres.'
      )

      return

    }


    if (
      mensajeLimpio.length > 2000
    ) {

      setErrorMensaje(
        'El mensaje no puede superar los 2000 caracteres.'
      )

      return

    }


    try {

      setEnviandoMensaje(true)


      const respuesta =
        await fetch(
          `/api/inmuebles/${inmueble.id}/mensajes`,
          {
            method: 'POST',

            headers: {
              Accept:
                'application/json',

              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({

              whatsapp:
                whatsappLimpio,

              mensaje:
                mensajeLimpio,

            }),
          }
        )


      const datos =
        await respuesta.json()


      if (!respuesta.ok) {

        if (
          respuesta.status === 401
        ) {

          throw new Error(
            'Tu sesión ha finalizado. Inicia sesión nuevamente.'
          )

        }


        if (
          respuesta.status === 422
        ) {

          throw new Error(

            datos.errors
              ?.whatsapp?.[0] ||

            datos.errors
              ?.mensaje?.[0] ||

            datos.mensaje ||

            'No se pudo enviar la consulta.'

          )

        }


        throw new Error(
          datos.mensaje ||
          'No se pudo enviar la consulta.'
        )

      }


      setWhatsappContacto('')
      setMensajeContacto('')
      setMensajeEnviado(true)


    } catch (error) {

      console.error(error)

      setErrorMensaje(
        error.message ||
        'No se pudo enviar la consulta.'
      )


    } finally {

      setEnviandoMensaje(false)

    }

  }


  /* =========================================
     INICIAL DEL PROPIETARIO
  ========================================= */

  function inicialPropietario() {

    const nombre =
      inmueble?.propietario?.name

    if (!nombre) {
      return 'H'
    }

    return nombre
      .charAt(0)
      .toUpperCase()

  }


  /* =========================================
     CARGANDO
  ========================================= */

  if (cargando) {

    return (

      <main className="detalle-luxury-estado">

        <p>
          Cargando propiedad...
        </p>

      </main>

    )

  }


  /* =========================================
     ERROR
  ========================================= */

  if (error) {

    return (

      <main className="detalle-luxury-estado">

        <p className="detalle-luxury-error">
          {error}
        </p>

      </main>

    )

  }


  /* =========================================
     NO ENCONTRADO
  ========================================= */

  if (!inmueble) {

    return (

      <main className="detalle-luxury-estado">

        <p>
          Inmueble no encontrado.
        </p>

      </main>

    )

  }


  /* =========================================
     DATOS
  ========================================= */

  const disponible =
    inmueble.estado
      ?.toLowerCase() ===
    'disponible'


  const latitud =
    Number(
      inmueble.latitud
    )


  const longitud =
    Number(
      inmueble.longitud
    )


  const coordenadasValidas =

    Number.isFinite(
      latitud
    ) &&

    Number.isFinite(
      longitud
    ) &&

    latitud >= -90 &&

    latitud <= 90 &&

    longitud >= -180 &&

    longitud <= 180


  const esPropietarioActual =

    usuarioActual &&

    inmueble.propietario &&

    Number(
      usuarioActual.id
    ) ===

    Number(
      inmueble.propietario.id
    )


  return (

    <main className="detalle-luxury">


      {/* =====================================
          ENCABEZADO
      ===================================== */}

      <section className="detalle-luxury-header">

        <div className="detalle-luxury-header-inner">


          <Link
            to="/inmuebles"
            className="detalle-volver"
          >

            <span>
              ←
            </span>

            Volver a propiedades

          </Link>


          <div className="detalle-heading">


            <div className="detalle-heading-info">


              <span className="detalle-eyebrow">

                {inmueble.tipo_vivienda}

              </span>


              <h1>

                {inmueble.titulo}

              </h1>


              <p>

                {inmueble.direccion}

              </p>


            </div>


            {/* PRECIO */}

            <div className="detalle-precio-top">


              <span>

                Precio mensual

              </span>


              <div>

                <strong>

                  $
                  {Number(
                    inmueble.precio
                  ).toFixed(0)}

                </strong>


                <small>

                  / mes

                </small>

              </div>


            </div>


          </div>


        </div>

      </section>



      {/* =====================================
          GALERÍA
      ===================================== */}

      <section className="detalle-galeria-wrapper">


        <div
          className={`
            detalle-galeria-grid
            detalle-fotos-${Math.min(
              imagenes.length,
              3
            )}
          `}
        >


          {/* SIN FOTOS */}

          {imagenes.length === 0 && (

            <div className="detalle-galeria-sin-fotos">


              <span>
                ◇
              </span>


              <strong>

                HomeLink
                <span>.</span>

              </strong>


              <small>

                Fotografía no disponible

              </small>


              <div className="detalle-estado-luxury">

                {inmueble.estado}

              </div>


            </div>

          )}



          {/* FOTO PRINCIPAL */}

          {imagenes.length >= 1 && (

            <button
              type="button"
              className="
                detalle-foto
                detalle-foto-principal
              "
              onClick={() =>
                abrirGaleria(0)
              }
            >


              <img
                src={imagenes[0]}
                alt={inmueble.titulo}
              />


              <span className="detalle-estado-luxury">

                {inmueble.estado}

              </span>


            </button>

          )}



          {/* FOTO 2 */}

          {imagenes.length >= 2 && (

            <button
              type="button"
              className="
                detalle-foto
                detalle-foto-secundaria
              "
              onClick={() =>
                abrirGaleria(1)
              }
            >


              <img
                src={imagenes[1]}
                alt={`
                  ${inmueble.titulo}
                  - fotografía 2
                `}
              />


            </button>

          )}



          {/* FOTO 3 */}

          {imagenes.length >= 3 && (

            <button
              type="button"
              className="
                detalle-foto
                detalle-foto-tercera
              "
              onClick={() =>
                abrirGaleria(2)
              }
            >


              <img
                src={imagenes[2]}
                alt={`
                  ${inmueble.titulo}
                  - fotografía 3
                `}
              />


              {imagenes.length > 3 && (

                <span className="detalle-ver-todas">


                  <strong>

                    +
                    {imagenes.length - 3}

                  </strong>


                  <small>

                    Ver todas las fotos

                  </small>


                </span>

              )}


            </button>

          )}


        </div>



        {/* =====================================
            VISOR DE FOTOGRAFÍAS
        ===================================== */}

        {galeriaAbierta &&
          imagenes.length > 0 && (

          <div
            className="detalle-lightbox"
            onClick={cerrarGaleria}
          >


            <button
              type="button"
              className="
                detalle-lightbox-cerrar
              "
              onClick={cerrarGaleria}
              aria-label="Cerrar galería"
            >

              ×

            </button>



            <div className="detalle-lightbox-contador">

              {imagenActiva + 1}

              {' / '}

              {imagenes.length}

            </div>



            {imagenes.length > 1 && (

              <button
                type="button"
                className="
                  detalle-lightbox-flecha
                  detalle-lightbox-anterior
                "
                onClick={(e) => {

                  e.stopPropagation()

                  imagenAnterior()

                }}
                aria-label="Fotografía anterior"
              >

                ←

              </button>

            )}



            <div
              className="
                detalle-lightbox-imagen
              "
              onClick={(e) =>
                e.stopPropagation()
              }
            >


              <img
                src={
                  imagenes[
                    imagenActiva
                  ]
                }
                alt={`
                  ${inmueble.titulo}
                  - fotografía
                  ${imagenActiva + 1}
                `}
              />


            </div>



            {imagenes.length > 1 && (

              <button
                type="button"
                className="
                  detalle-lightbox-flecha
                  detalle-lightbox-siguiente
                "
                onClick={(e) => {

                  e.stopPropagation()

                  imagenSiguiente()

                }}
                aria-label="Fotografía siguiente"
              >

                →

              </button>

            )}


          </div>

        )}


      </section>



      {/* =====================================
          CONTENIDO
      ===================================== */}

      <section className="detalle-contenido">


        <div className="detalle-principal">


          {/* =================================
              RESUMEN
          ================================= */}

          <div className="detalle-resumen">


            <div>

              <span>
                01
              </span>

              <strong>

                {inmueble.habitaciones}

              </strong>

              <small>

                Habitaciones

              </small>

            </div>



            <div>

              <span>
                02
              </span>

              <strong>

                {inmueble.banos}

              </strong>

              <small>

                Baños

              </small>

            </div>



            <div>

              <span>
                03
              </span>

              <strong>

                {inmueble.area
                  ? `${inmueble.area} m²`
                  : '—'}

              </strong>

              <small>

                Área

              </small>

            </div>



            <div>

              <span>
                04
              </span>

              <strong>

                {disponible
                  ? 'Sí'
                  : 'No'}

              </strong>

              <small>

                Disponible

              </small>

            </div>


          </div>



          {/* =================================
              DESCRIPCIÓN
          ================================= */}

          <section className="detalle-descripcion-luxury">


            <span className="detalle-seccion-label">

              Sobre la propiedad

            </span>


            <h2>

              Un espacio pensado para

              <em>
                {' '}vivir mejor.
              </em>

            </h2>


            <p>

              {inmueble.descripcion ||

                `Esta propiedad aún no
                cuenta con una descripción.`}

            </p>


          </section>



          {/* =================================
              UBICACIÓN
          ================================= */}

          <section className="detalle-ubicacion">


            <span className="detalle-seccion-label">

              Ubicación

            </span>


            <h2>

              Dónde se encuentra

            </h2>


            <p className="detalle-direccion">

              {inmueble.direccion}

            </p>



            {coordenadasValidas ? (

              <div className="detalle-mapa">


                <MapContainer

                  center={[
                    latitud,
                    longitud
                  ]}

                  zoom={15}

                  scrollWheelZoom={false}

                  className="
                    detalle-mapa-leaflet
                  "
                >


                  <TileLayer

                    attribution="
                      &copy; OpenStreetMap
                      contributors
                    "

                    url="
                      https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
                    "

                  />


                  <Marker

                    position={[
                      latitud,
                      longitud
                    ]}

                    icon={iconoUbicacion}

                  >


                    <Popup>


                      <div className="detalle-popup">


                        <strong>

                          {inmueble.titulo}

                        </strong>


                        <span>

                          {inmueble.direccion}

                        </span>


                      </div>


                    </Popup>


                  </Marker>


                </MapContainer>


              </div>

            ) : (


              <div className="detalle-mapa-vacio">


                <div className="
                  detalle-mapa-vacio-icono
                ">

                  ◇

                </div>


                <div>


                  <strong>

                    Ubicación en el mapa
                    no disponible

                  </strong>


                  <p>

                    Esta propiedad todavía
                    no tiene una ubicación
                    válida registrada.

                  </p>


                </div>


              </div>

            )}


          </section>


        </div>



        {/* =====================================
            TARJETA LATERAL
        ===================================== */}

        <aside className="detalle-sidebar">


          <div className="detalle-sidebar-card">


            <span className="detalle-sidebar-label">

              Propiedad HomeLink

            </span>


            <h3>

              ¿Te interesa esta propiedad?

            </h3>


            <p>

              Envía una consulta al propietario
              y deja tu WhatsApp para que pueda
              ponerse en contacto contigo.

            </p>



            {/* PROPIETARIO */}

            {inmueble.propietario ? (

              <div className="
                detalle-propietario-box
              ">


                <div className="
                  detalle-propietario-avatar
                ">

                  {inicialPropietario()}

                </div>


                <div className="
                  detalle-propietario-info
                ">


                  <span>

                    Propietario

                  </span>


                  <strong>

                    {
                      inmueble
                        .propietario
                        .name
                    }

                  </strong>


                </div>


              </div>

            ) : (

              <div className="
                detalle-propietario-no-disponible
              ">

                Información del propietario
                no disponible.

              </div>

            )}



            {/* CONTACTAR */}

            <button
              type="button"
              className="detalle-contactar"
              onClick={abrirContacto}
            >


              <span>

                Contactar propietario

              </span>


              <span>

                ↗

              </span>


            </button>


          </div>



          {/* INFORMACIÓN ADICIONAL */}

          <div className="
            detalle-sidebar-informacion
          ">


            <div className="
              detalle-sidebar-dato
            ">


              <span>

                Tipo de propiedad

              </span>


              <strong>

                {inmueble.tipo_vivienda}

              </strong>


            </div>



            <div className="
              detalle-sidebar-dato
            ">


              <span>

                Estado

              </span>


              <strong>

                {inmueble.estado}

              </strong>


            </div>


          </div>


        </aside>


      </section>



      {/* =====================================
          MODAL DE CONTACTO
      ===================================== */}

      {contactoAbierto && (

        <div
          className="detalle-contacto-fondo"
          onClick={cerrarContacto}
        >

          <div
            className="detalle-contacto-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            <button
              type="button"
              className="detalle-contacto-cerrar"
              onClick={cerrarContacto}
              disabled={enviandoMensaje}
              aria-label="Cerrar"
            >

              ×

            </button>


            <span className="detalle-contacto-eyebrow">

              HOMELINK · CONTACTO

            </span>


            <h2>

              Habla con el propietario

            </h2>


            <p className="detalle-contacto-intro">

              Envía una consulta sobre

              <strong>
                {' '}
                {inmueble.titulo}
              </strong>.

            </p>



            {/* PROPIETARIO */}

            {inmueble.propietario && (

              <div className="detalle-contacto-propietario">


                <div className="detalle-contacto-avatar">

                  {inicialPropietario()}

                </div>


                <div>

                  <span>

                    PROPIETARIO

                  </span>

                  <strong>

                    {inmueble.propietario.name}

                  </strong>

                </div>


              </div>

            )}



            {/* PROPIETARIO VIENDO SU PROPIEDAD */}

            {esPropietarioActual ? (

              <div className="detalle-contacto-propia">

                <span className="detalle-contacto-propia-icono">
                  ◇
                </span>

                <strong>
                  Esta es tu propiedad
                </strong>

                <p>
                  No puedes enviarte una consulta
                  a ti misma. Las consultas de
                  otros usuarios aparecerán en
                  tu panel de HomeLink.
                </p>

                <Link
                  to="/dashboard"
                  className="detalle-contacto-panel"
                >
                  Ir a mi panel →
                </Link>

              </div>

            ) : !token || !usuarioActual ? (


              /* SIN SESIÓN */

              <div className="detalle-contacto-login">

                <span>

                  ACCESO REQUERIDO

                </span>


                <p>

                  Para contactar al propietario
                  necesitas iniciar sesión en
                  HomeLink.

                </p>


                <Link
                  to="/login"
                  className="
                    detalle-contacto-login-boton
                  "
                >

                  Iniciar sesión →

                </Link>


              </div>

            ) : (


              /* =====================================
                 FORMULARIO
              ===================================== */

              <form onSubmit={enviarMensaje}>


                {/* WHATSAPP */}

                <div className="detalle-contacto-campo">


                  <label
                    htmlFor="whatsappContacto"
                    className="detalle-contacto-label"
                  >

                    TU WHATSAPP

                  </label>


                  <div className="detalle-contacto-whatsapp">


                    <span>
                      WA
                    </span>


                    <input
                      id="whatsappContacto"
                      type="tel"
                      value={whatsappContacto}
                      onChange={(e) =>
                        setWhatsappContacto(
                          e.target.value
                        )
                      }
                      placeholder="Ej. 8888 8888"
                      maxLength={20}
                      autoComplete="tel"
                      disabled={
                        enviandoMensaje ||
                        mensajeEnviado
                      }
                    />


                  </div>


                  <small className="detalle-contacto-ayuda">

                    El propietario podrá utilizar
                    este número únicamente para
                    responder a tu consulta.

                  </small>


                </div>



                {/* MENSAJE */}

                <label
                  htmlFor="mensajeContacto"
                  className="detalle-contacto-label"
                >

                  TU MENSAJE

                </label>


                <textarea
                  id="mensajeContacto"
                  value={mensajeContacto}
                  onChange={(e) =>
                    setMensajeContacto(
                      e.target.value
                    )
                  }
                  placeholder="Hola, me interesa esta propiedad. Me gustaría recibir más información..."
                  maxLength={2000}
                  disabled={
                    enviandoMensaje ||
                    mensajeEnviado
                  }
                />


                <div className="detalle-contacto-contador">

                  {mensajeContacto.length}
                  {' / '}
                  2000

                </div>



                {/* ERROR */}

                {errorMensaje && (

                  <div className="detalle-contacto-error">

                    {errorMensaje}

                  </div>

                )}



                {/* ÉXITO */}

                {mensajeEnviado && (

                  <div className="detalle-contacto-exito">


                    <span>

                      ✓

                    </span>


                    <div>

                      <strong>

                        Consulta enviada

                      </strong>


                      <p>

                        El propietario podrá
                        ver tu consulta desde
                        su panel de HomeLink
                        y contactarte por WhatsApp.

                      </p>

                    </div>


                  </div>

                )}



                {/* ENVIAR */}

                {!mensajeEnviado && (

                  <button
                    type="submit"
                    className="
                      detalle-contacto-enviar
                    "
                    disabled={enviandoMensaje}
                  >

                    <span>

                      {enviandoMensaje
                        ? 'Enviando...'
                        : 'Enviar consulta'}

                    </span>


                    {!enviandoMensaje && (

                      <span>
                        →
                      </span>

                    )}


                  </button>

                )}



                {/* LISTO */}

                {mensajeEnviado && (

                  <button
                    type="button"
                    className="
                      detalle-contacto-listo
                    "
                    onClick={cerrarContacto}
                  >

                    Listo

                  </button>

                )}


              </form>

            )}


          </div>

        </div>

      )}


    </main>

  )

}


export default DetalleInmueble