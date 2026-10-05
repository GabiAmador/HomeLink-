import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'


/* =========================================================
   ICONO DEL MAPA
========================================================= */

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


/* =========================================================
   COMPONENTE PARA SELECCIONAR UBICACIÓN
========================================================= */

function SelectorUbicacion({
  posicion,
  onSeleccionar,
}) {

  useMapEvents({

    click(e) {

      onSeleccionar({
        latitud: e.latlng.lat,
        longitud: e.latlng.lng,
      })

    },

  })


  if (!posicion) {
    return null
  }


  return (

    <Marker
      position={[
        posicion.latitud,
        posicion.longitud,
      ]}
      icon={iconoUbicacion}
    >

      <Popup>
        Ubicación de la propiedad
      </Popup>

    </Marker>

  )

}


/* =========================================================
   PUBLICAR INMUEBLE
========================================================= */

function PublicarInmueble() {


  /* =======================================================
     FORMULARIO INICIAL
  ======================================================= */

  const formularioInicial = {

    titulo: '',

    descripcion: '',

    precio: '',

    tipo_vivienda: 'Casa',

    habitaciones: '',

    banos: '',

    area: '',

    direccion: '',

    latitud: '',

    longitud: '',

    estado: 'disponible',

  }


  /* =======================================================
     ESTADOS
  ======================================================= */

  const [formulario, setFormulario] =
    useState(formularioInicial)

  const [imagenes, setImagenes] =
    useState([])

  const [
    previsualizaciones,
    setPrevisualizaciones,
  ] = useState([])

  const [mensaje, setMensaje] =
    useState('')

  const [error, setError] =
    useState('')

  const [guardando, setGuardando] =
    useState(false)


  /* =======================================================
     CAMBIAR CAMPOS
  ======================================================= */

  function cambiarCampo(e) {

    const { name, value } = e.target

    setFormulario((actual) => ({

      ...actual,

      [name]: value,

    }))

  }


  /* =======================================================
     SELECCIONAR UBICACIÓN EN MAPA
  ======================================================= */

  function seleccionarUbicacion({
    latitud,
    longitud,
  }) {

    setFormulario((actual) => ({

      ...actual,

      latitud: latitud.toFixed(7),

      longitud: longitud.toFixed(7),

    }))

  }


  /* =======================================================
     SELECCIONAR FOTOGRAFÍAS
  ======================================================= */

  function seleccionarImagenes(e) {

    const archivos =
      Array.from(e.target.files)


    if (archivos.length > 8) {

      setError(
        'Puedes seleccionar un máximo de 8 fotografías.'
      )

      return

    }


    const archivoMuyGrande =
      archivos.find(
        (archivo) =>
          archivo.size > 5 * 1024 * 1024
      )


    if (archivoMuyGrande) {

      setError(
        'Cada fotografía debe pesar como máximo 5 MB.'
      )

      return

    }


    setError('')

    previsualizaciones.forEach((url) => {
      URL.revokeObjectURL(url)
    })


    setImagenes(archivos)


    const nuevasPrevisualizaciones =
      archivos.map((archivo) =>
        URL.createObjectURL(archivo)
      )


    setPrevisualizaciones(
      nuevasPrevisualizaciones
    )

  }


  /* =======================================================
     ELIMINAR FOTOGRAFÍA
  ======================================================= */

  function eliminarImagen(indice) {

    URL.revokeObjectURL(
      previsualizaciones[indice]
    )


    setImagenes((actuales) =>
      actuales.filter(
        (_, i) => i !== indice
      )
    )


    setPrevisualizaciones((actuales) =>
      actuales.filter(
        (_, i) => i !== indice
      )
    )

  }


  /* =======================================================
     LIMPIAR URLs DE PREVISUALIZACIÓN
  ======================================================= */

  useEffect(() => {

    return () => {

      previsualizaciones.forEach(
        (url) => {
          URL.revokeObjectURL(url)
        }
      )

    }

  }, [previsualizaciones])


  /* =======================================================
     PUBLICAR
  ======================================================= */

  async function publicar(e) {

    e.preventDefault()

    setMensaje('')
    setError('')


    /* UBICACIÓN OBLIGATORIA */

    if (
      formulario.latitud === '' ||
      formulario.longitud === ''
    ) {

      setError(
        'Selecciona la ubicación de la propiedad en el mapa.'
      )

      return

    }


    setGuardando(true)


    const token =
      localStorage.getItem('token')


    if (!token) {

      setError(
        'Debes iniciar sesión para publicar una propiedad.'
      )

      setGuardando(false)

      return

    }


    const datos = new FormData()


    datos.append(
      'titulo',
      formulario.titulo
    )

    datos.append(
      'descripcion',
      formulario.descripcion
    )

    datos.append(
      'precio',
      formulario.precio
    )

    datos.append(
      'tipo_vivienda',
      formulario.tipo_vivienda
    )

    datos.append(
      'habitaciones',
      formulario.habitaciones
    )

    datos.append(
      'banos',
      formulario.banos
    )

    datos.append(
      'area',
      formulario.area
    )

    datos.append(
      'direccion',
      formulario.direccion
    )

    datos.append(
      'estado',
      formulario.estado
    )

    datos.append(
      'latitud',
      formulario.latitud
    )

    datos.append(
      'longitud',
      formulario.longitud
    )


    imagenes.forEach((imagen) => {

      datos.append(
        'imagenes[]',
        imagen
      )

    })


    try {

      const respuesta =
        await fetch(
          '/api/inmuebles',
          {

            method: 'POST',

            headers: {

              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,

            },

            body: datos,

          }
        )


      const resultado =
        await respuesta.json()


      if (!respuesta.ok) {

        if (resultado.errors) {

          const primerError =
            Object.values(
              resultado.errors
            )[0]?.[0]


          throw new Error(
            primerError
          )

        }


        throw new Error(

          resultado.message ||

          'No se pudo publicar el inmueble'

        )

      }


      setMensaje(
        'Propiedad publicada correctamente.'
      )


      previsualizaciones.forEach(
        (url) => {
          URL.revokeObjectURL(url)
        }
      )


      setFormulario(
        formularioInicial
      )

      setImagenes([])

      setPrevisualizaciones([])


    } catch (error) {

      console.error(error)


      setError(

        error.message ||

        'Ocurrió un error al publicar el inmueble.'

      )


    } finally {

      setGuardando(false)

    }

  }


  /* =======================================================
     POSICIÓN SELECCIONADA
  ======================================================= */

  const posicionSeleccionada =

    formulario.latitud !== '' &&
    formulario.longitud !== ''

      ? {

          latitud:
            Number(formulario.latitud),

          longitud:
            Number(formulario.longitud),

        }

      : null


  /* =======================================================
     VISTA
  ======================================================= */

  return (

    <main className="publicar-pagina">


      {/* ===================================================
          HERO / ENCABEZADO
      =================================================== */}

      <section className="publicar-encabezado">

        <div className="publicar-encabezado-decoracion" />
        <div
  className="publicar-casa-decorativa"
  aria-hidden="true"
/>


        <div className="publicar-encabezado-contenido">

          <span className="publicar-eyebrow">

            Publica en HomeLink

          </span>


          <h1>

            Presenta tu propiedad
            <em> de la mejor manera.</em>

          </h1>


          <p>

            Completa la información,
            selecciona la ubicación y
            agrega fotografías para
            publicar tu inmueble.

          </p>

        </div>


        

      </section>



      {/* ===================================================
          FORMULARIO
      =================================================== */}

      <form
        className="publicar-formulario"
        onSubmit={publicar}
      >


        {/* =================================================
            01 — INFORMACIÓN BÁSICA
        ================================================= */}

        <section className="form-seccion">


          <div className="form-seccion-titulo">

            <span>01</span>


            <div>

              <h2>
                Información básica
              </h2>

              <p>

                Cuéntanos las características
                principales de la propiedad.

              </p>

            </div>

          </div>



          <div className="form-grid">


            {/* TÍTULO */}

            <div className="
              campo
              campo-completo
            ">

              <label>
                Título de la propiedad
              </label>


              <input
                type="text"
                name="titulo"
                value={formulario.titulo}
                onChange={cambiarCampo}
                placeholder="
                  Ej. Casa moderna cerca del centro
                "
                required
              />

            </div>



            {/* TIPO */}

            <div className="campo">

              <label>
                Tipo de vivienda
              </label>


              <select
                name="tipo_vivienda"
                value={
                  formulario.tipo_vivienda
                }
                onChange={cambiarCampo}
              >

                <option value="Casa">
                  Casa
                </option>

                <option value="Apartamento">
                  Apartamento
                </option>

              </select>

            </div>



            {/* PRECIO */}

            <div className="campo">

              <label>
                Precio mensual
              </label>


              <div className="campo-con-unidad">

                <span>$</span>

                <input
                  type="number"
                  name="precio"
                  min="0"
                  step="0.01"
                  value={
                    formulario.precio
                  }
                  onChange={cambiarCampo}
                  placeholder="250"
                  required
                />

              </div>

            </div>



            {/* HABITACIONES */}

            <div className="campo">

              <label>
                Habitaciones
              </label>


              <input
                type="number"
                name="habitaciones"
                min="0"
                value={
                  formulario.habitaciones
                }
                onChange={cambiarCampo}
                placeholder="3"
                required
              />

            </div>



            {/* BAÑOS */}

            <div className="campo">

              <label>
                Baños
              </label>


              <input
                type="number"
                name="banos"
                min="0"
                value={
                  formulario.banos
                }
                onChange={cambiarCampo}
                placeholder="2"
                required
              />

            </div>



            {/* ÁREA */}

            <div className="campo">

              <label>
                Área de la propiedad
              </label>


              <div className="campo-con-unidad campo-area">

                <input
                  type="number"
                  name="area"
                  min="1"
                  step="0.01"
                  value={
                    formulario.area
                  }
                  onChange={cambiarCampo}
                  placeholder="180"
                  required
                />

                <span>
                  m²
                </span>

              </div>

            </div>


          </div>

        </section>



        {/* =================================================
            02 — UBICACIÓN
        ================================================= */}

        <section className="
          form-seccion
          form-seccion-ubicacion
        ">


          <div className="form-seccion-titulo">

            <span>02</span>


            <div>

              <h2>
                Ubicación
              </h2>

              <p>

                Escribe la dirección y marca
                en el mapa dónde se encuentra
                la propiedad.

              </p>

            </div>

          </div>



          <div className="campo campo-completo">

            <label>
              Dirección
            </label>


            <input
              type="text"
              name="direccion"
              value={
                formulario.direccion
              }
              onChange={cambiarCampo}
              placeholder="
                Ej. Barrio San Antonio, Jinotega
              "
              required
            />

          </div>



          {/* MAPA */}

          <div className="publicar-mapa-bloque">


            <div className="publicar-mapa-cabecera">


              <div>

                <span>
                  Selecciona la ubicación
                </span>

                <strong>
                  Haz clic sobre el mapa
                </strong>

              </div>


              {posicionSeleccionada ? (

                <div className="
                  publicar-ubicacion-lista
                ">

                  <span className="
                    publicar-punto-activo
                  " />

                  Ubicación seleccionada

                </div>

              ) : (

                <div className="
                  publicar-ubicacion-pendiente
                ">

                  Ubicación pendiente

                </div>

              )}


            </div>



            <div className="publicar-mapa">


              <MapContainer

                /*
                  El mapa inicia en Jinotega
                  solamente como vista inicial.

                  La ubicación de la propiedad
                  será la que el propietario
                  seleccione haciendo clic.
                */

                center={[
                  13.091,
                  -86.001,
                ]}

                zoom={13}

                scrollWheelZoom={true}

                className="
                  publicar-mapa-leaflet
                "
              >


                <TileLayer

                  attribution="
                    &copy; OpenStreetMap contributors
                  "

                  url="
                    https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
                  "

                />


                <SelectorUbicacion

                  posicion={
                    posicionSeleccionada
                  }

                  onSeleccionar={
                    seleccionarUbicacion
                  }

                />


              </MapContainer>


            </div>



            <div className="publicar-mapa-ayuda">


              <span>
                📍
              </span>


              <p>

                <strong>
                  ¿Cómo seleccionar la ubicación?
                </strong>

                Busca el sector correspondiente
                y haz clic en el punto donde se
                encuentra la propiedad. Puedes
                cambiarlo haciendo clic nuevamente.

              </p>


            </div>


          </div>

        </section>



        {/* =================================================
            03 — FOTOGRAFÍAS
        ================================================= */}

        <section className="form-seccion">


          <div className="form-seccion-titulo">

            <span>03</span>


            <div>

              <h2>
                Fotografías
              </h2>

              <p>

                Muestra los mejores espacios
                de la propiedad. La primera
                fotografía será la portada.

              </p>

            </div>

          </div>



          <label
            className="subir-imagenes"
            htmlFor="imagenes"
          >


            <div className="subir-icono">

              +

            </div>


            <strong>

              Seleccionar fotografías

            </strong>


            <span>

              JPG, PNG o WEBP ·
              máximo 8 fotografías ·
              5 MB por foto

            </span>


            <input
              id="imagenes"
              type="file"
              accept="
                image/jpeg,
                image/png,
                image/webp
              "
              multiple
              onChange={
                seleccionarImagenes
              }
            />


          </label>



          {previsualizaciones.length > 0 && (

            <div className="imagenes-preview">


              {previsualizaciones.map(
                (imagen, indice) => (

                  <div
                    className="preview-imagen"
                    key={imagen}
                  >


                    <img
                      src={imagen}
                      alt={
                        `Vista previa ${
                          indice + 1
                        }`
                      }
                    />


                    {indice === 0 && (

                      <span className="
                        foto-principal
                      ">

                        Portada

                      </span>

                    )}


                    <span className="
                      preview-numero
                    ">

                      {String(
                        indice + 1
                      ).padStart(2, '0')}

                    </span>


                    <button
                      type="button"
                      className="
                        eliminar-foto
                      "
                      onClick={() =>
                        eliminarImagen(
                          indice
                        )
                      }
                      aria-label="
                        Eliminar fotografía
                      "
                    >

                      ×

                    </button>


                  </div>

                )
              )}


            </div>

          )}


        </section>



        {/* =================================================
            04 — DESCRIPCIÓN
        ================================================= */}

        <section className="form-seccion">


          <div className="form-seccion-titulo">

            <span>04</span>


            <div>

              <h2>
                Descripción
              </h2>

              <p>

                Describe los espacios,
                características y condiciones
                principales de la vivienda.

              </p>

            </div>

          </div>



          <div className="
            campo
            campo-completo
          ">


            <label>
              Descripción de la propiedad
            </label>


            <textarea
              name="descripcion"
              value={
                formulario.descripcion
              }
              onChange={cambiarCampo}
              rows="7"
              placeholder="
                Describe la vivienda, sus espacios,
                acabados, servicios cercanos y
                cualquier característica importante...
              "
              required
            />


          </div>


        </section>



        {/* =================================================
            05 — ESTADO
        ================================================= */}

        <section className="form-seccion">


          <div className="form-seccion-titulo">

            <span>05</span>


            <div>

              <h2>
                Disponibilidad
              </h2>

              <p>

                Indica el estado actual
                de la propiedad.

              </p>

            </div>

          </div>



          <div className="
            campo
            campo-estado
          ">


            <label>
              Estado
            </label>


            <select
              name="estado"
              value={
                formulario.estado
              }
              onChange={
                cambiarCampo
              }
            >

              <option value="disponible">

                Disponible

              </option>

              <option value="alquilado">

                Alquilado

              </option>

            </select>


          </div>


        </section>



        {/* =================================================
            MENSAJES
        ================================================= */}

        {mensaje && (

          <div className="mensaje-exito">


            <div>

              <strong>
                Propiedad publicada
              </strong>

              <span>
                {mensaje}
              </span>

            </div>


            <Link to="/inmuebles">

              Ver propiedades →

            </Link>


          </div>

        )}



        {error && (

          <div className="mensaje-error">

            {error}

          </div>

        )}



        {/* =================================================
            BOTÓN FINAL
        ================================================= */}

        <div className="form-acciones">


          <div className="form-acciones-texto">

            <span>
              HomeLink
            </span>

            <p>
              Revisa la información antes
              de publicar.
            </p>

          </div>


          <button
            type="submit"
            className="btn-publicar-form"
            disabled={guardando}
          >


            <span>

              {guardando
                ? 'Publicando...'
                : 'Publicar propiedad'}

            </span>


            {!guardando && (
              <span>
                ↗
              </span>
            )}


          </button>


        </div>


      </form>


    </main>

  )

}


export default PublicarInmueble