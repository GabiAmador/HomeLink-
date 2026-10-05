import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'

import L from 'leaflet'

import {
  obtenerToken,
} from '../services/auth'


const iconoMarcador =
  new L.Icon({

    iconUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

    shadowUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',

    iconSize:
      [25, 41],

    iconAnchor:
      [12, 41],

    popupAnchor:
      [1, -34],

    shadowSize:
      [41, 41],
  })


function CentrarMapa({
  posicion,
}) {

  const mapa =
    useMap()


  useEffect(() => {

    if (!posicion) {
      return
    }


    mapa.setView(
      posicion,
      16,
      {
        animate: true,
      }
    )

  }, [posicion, mapa])


  return null
}


function SelectorUbicacion({
  posicion,
  onSeleccionar,
}) {

  useMapEvents({

    click(evento) {

      onSeleccionar({

        latitud:
          evento.latlng.lat
            .toFixed(7),

        longitud:
          evento.latlng.lng
            .toFixed(7),
      })
    },
  })


  if (!posicion) {
    return null
  }


  return (

    <Marker
      position={posicion}
      icon={iconoMarcador}
    >

      <Popup>
        Ubicación de la propiedad
      </Popup>

    </Marker>

  )
}


function EditarInmueble() {

  const { id } =
    useParams()

  const navigate =
    useNavigate()


  const [
    cargando,
    setCargando,
  ] = useState(true)


  const [
    guardando,
    setGuardando,
  ] = useState(false)


  const [
    error,
    setError,
  ] = useState('')


  const [
    mensaje,
    setMensaje,
  ] = useState('')


  const [
    imagenesActuales,
    setImagenesActuales,
  ] = useState([])


  const [
    imagenesNuevas,
    setImagenesNuevas,
  ] = useState([])


  const [
    previsualizaciones,
    setPrevisualizaciones,
  ] = useState([])


  const [
    imagenEliminar,
    setImagenEliminar,
  ] = useState(null)


  const [
    procesandoImagen,
    setProcesandoImagen,
  ] = useState(false)


  const [
    formulario,
    setFormulario,
  ] = useState({

    titulo: '',
    descripcion: '',
    precio: '',
    tipo_vivienda: '',
    habitaciones: '',
    banos: '',
    area: '',
    direccion: '',
    latitud: '',
    longitud: '',
    estado: 'disponible',

  })


  /* ======================================================
     CARGAR INMUEBLE
     ====================================================== */

  useEffect(() => {
    cargarInmueble()
  }, [id])


  async function cargarInmueble() {

    try {

      setCargando(true)
      setError('')


      const respuesta =
        await fetch(
          `/api/inmuebles/${id}`,
          {
            headers: {
              Accept:
                'application/json',
            },
          }
        )


      if (!respuesta.ok) {

        throw new Error(
          'No fue posible cargar la propiedad.'
        )
      }


      const inmueble =
        await respuesta.json()


      setFormulario({

        titulo:
          inmueble.titulo ?? '',

        descripcion:
          inmueble.descripcion ?? '',

        precio:
          inmueble.precio ?? '',

        tipo_vivienda:
          inmueble.tipo_vivienda ?? '',

        habitaciones:
          inmueble.habitaciones ?? '',

        banos:
          inmueble.banos ?? '',

        area:
          inmueble.area ?? '',

        direccion:
          inmueble.direccion ?? '',

        latitud:
          inmueble.latitud ?? '',

        longitud:
          inmueble.longitud ?? '',

        estado:
          inmueble.estado ??
          'disponible',
      })


      setImagenesActuales(
        Array.isArray(
          inmueble.imagenes
        )
          ? inmueble.imagenes
          : []
      )

    } catch (error) {

      console.error(error)

      setError(
        'No pudimos cargar la información de esta propiedad.'
      )

    } finally {

      setCargando(false)
    }
  }


  /* ======================================================
     CAMPOS
     ====================================================== */

  function cambiarCampo(evento) {

    const {
      name,
      value,
    } = evento.target


    setFormulario(
      (anterior) => ({
        ...anterior,
        [name]: value,
      })
    )
  }


  /* ======================================================
     MAPA
     ====================================================== */

  function seleccionarUbicacion(
    coordenadas
  ) {

    setFormulario(
      (anterior) => ({

        ...anterior,

        latitud:
          coordenadas.latitud,

        longitud:
          coordenadas.longitud,

      })
    )
  }


  const latitudNumero =
    Number(
      formulario.latitud
    )


  const longitudNumero =
    Number(
      formulario.longitud
    )


  const coordenadasValidas =
    formulario.latitud !== '' &&
    formulario.longitud !== '' &&
    Number.isFinite(
      latitudNumero
    ) &&
    Number.isFinite(
      longitudNumero
    ) &&
    latitudNumero >= -90 &&
    latitudNumero <= 90 &&
    longitudNumero >= -180 &&
    longitudNumero <= 180


  const posicion =
    coordenadasValidas
      ? [
          latitudNumero,
          longitudNumero,
        ]
      : null


  const centroMapa =
    posicion ||
    [
      13.091,
      -86.001,
    ]


  /* ======================================================
     SELECCIONAR FOTOS NUEVAS
     ====================================================== */

  function seleccionarImagenes(
    evento
  ) {

    const archivos =
      Array.from(
        evento.target.files ||
        []
      )


    if (
      archivos.length === 0
    ) {
      return
    }


    const disponibles =
      8 -
      imagenesActuales.length -
      imagenesNuevas.length


    if (
      disponibles <= 0
    ) {

      setError(
        'La propiedad ya tiene el máximo de 8 fotografías.'
      )

      evento.target.value = ''

      return
    }


    const validas =
      archivos
        .filter(
          (archivo) =>
            archivo.type.startsWith(
              'image/'
            ) &&
            archivo.size <=
              5 * 1024 * 1024
        )
        .slice(
          0,
          disponibles
        )


    if (
      validas.length <
      archivos.length
    ) {

      setError(
        'Solo se agregaron las fotografías válidas. Cada imagen debe pesar como máximo 5 MB y puedes tener hasta 8.'
      )

    } else {

      setError('')
    }


    const nuevasUrls =
      validas.map(
        (archivo) =>
          URL.createObjectURL(
            archivo
          )
      )


    setImagenesNuevas(
      (anteriores) => [
        ...anteriores,
        ...validas,
      ]
    )


    setPrevisualizaciones(
      (anteriores) => [
        ...anteriores,
        ...nuevasUrls,
      ]
    )


    evento.target.value = ''
  }


  /* ======================================================
     QUITAR FOTO NUEVA
     ====================================================== */

  function quitarImagenNueva(
    indice
  ) {

    URL.revokeObjectURL(
      previsualizaciones[
        indice
      ]
    )


    setImagenesNuevas(
      (anteriores) =>
        anteriores.filter(
          (_, i) =>
            i !== indice
        )
    )


    setPrevisualizaciones(
      (anteriores) =>
        anteriores.filter(
          (_, i) =>
            i !== indice
        )
    )
  }


  /* ======================================================
     CAMBIAR PORTADA
     ====================================================== */

  async function establecerPortada(
    imagen
  ) {

    try {

      setProcesandoImagen(true)
      setError('')
      setMensaje('')


      const token =
        obtenerToken()


      const respuesta =
        await fetch(
          `/api/inmuebles/${id}/imagenes/${imagen.id}/principal`,
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


      const resultado =
        await respuesta.json()


      if (!respuesta.ok) {

        throw new Error(
          resultado.mensaje ||
          'No fue posible cambiar la portada.'
        )
      }


      setImagenesActuales(
        resultado.imagenes ||
        []
      )


      setMensaje(
        'La fotografía principal fue actualizada.'
      )

    } catch (error) {

      console.error(error)

      setError(
        error.message
      )

    } finally {

      setProcesandoImagen(false)
    }
  }


  /* ======================================================
     ELIMINAR FOTO ACTUAL
     ====================================================== */

  async function eliminarImagenActual() {

    if (!imagenEliminar) {
      return
    }


    try {

      setProcesandoImagen(true)
      setError('')
      setMensaje('')


      const token =
        obtenerToken()


      const respuesta =
        await fetch(
          `/api/inmuebles/${id}/imagenes/${imagenEliminar.id}`,
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
          'No fue posible eliminar la fotografía.'
        )
      }


      setImagenesActuales(
        resultado.imagenes ||
        []
      )


      setImagenEliminar(null)


      setMensaje(
        'La fotografía fue eliminada correctamente.'
      )

    } catch (error) {

      console.error(error)

      setError(
        error.message
      )

    } finally {

      setProcesandoImagen(false)
    }
  }


  /* ======================================================
     GUARDAR CAMBIOS
     ====================================================== */

  async function guardarCambios(
    evento
  ) {

    evento.preventDefault()

    setError('')
    setMensaje('')


    if (
      !coordenadasValidas
    ) {

      setError(
        'Selecciona una ubicación válida en el mapa.'
      )

      return
    }


    try {

      setGuardando(true)


      const token =
        obtenerToken()


      if (!token) {

        setError(
          'Tu sesión no está disponible. Inicia sesión nuevamente.'
        )

        return
      }


      const datos =
        new FormData()


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
        'latitud',
        formulario.latitud
      )

      datos.append(
        'longitud',
        formulario.longitud
      )

      datos.append(
        'estado',
        formulario.estado
      )


      imagenesNuevas.forEach(
        (imagen) => {

          datos.append(
            'imagenes[]',
            imagen
          )

        }
      )


      datos.append(
        '_method',
        'PUT'
      )


      const respuesta =
        await fetch(
          `/api/inmuebles/${id}`,
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

        if (
          resultado.errors
        ) {

          const primerError =
            Object.values(
              resultado.errors
            )[0]


          throw new Error(
            Array.isArray(
              primerError
            )
              ? primerError[0]
              : primerError
          )
        }


        throw new Error(
          resultado.mensaje ||
          'No fue posible actualizar la propiedad.'
        )
      }


      setMensaje(
        'Los cambios se guardaron correctamente.'
      )


      if (
        resultado.inmueble
      ) {

        setImagenesActuales(
          resultado.inmueble
            .imagenes ||
          []
        )
      }


      previsualizaciones.forEach(
        (url) =>
          URL.revokeObjectURL(
            url
          )
      )


      setImagenesNuevas([])
      setPrevisualizaciones([])


      setTimeout(() => {

        navigate(
          '/dashboard'
        )

      }, 900)

    } catch (error) {

      console.error(error)

      setError(
        error.message ||
        'No fue posible guardar los cambios.'
      )

    } finally {

      setGuardando(false)
    }
  }


  /* ======================================================
     CARGANDO
     ====================================================== */

  if (cargando) {

    return (

      <main className="editar-pagina">

        <div className="editar-cargando">

          <span>
            HOMELINK
          </span>

          <h1>
            Preparando la propiedad...
          </h1>

        </div>

      </main>

    )
  }


  /* ======================================================
     ERROR DE CARGA
     ====================================================== */

  if (
    error &&
    !formulario.titulo
  ) {

    return (

      <main className="editar-pagina">

        <div className="editar-cargando">

          <span>
            HOMELINK
          </span>

          <h1>
            No pudimos abrir esta propiedad.
          </h1>

          <p>
            {error}
          </p>

          <Link to="/dashboard">
            Volver al panel
          </Link>

        </div>

      </main>

    )
  }


  return (

    <main className="editar-pagina">


      {/* ENCABEZADO */}

      <section className="editar-encabezado">

        <div className="editar-encabezado-contenido">

          <span className="editar-eyebrow">
            GESTIÓN DE PROPIEDAD
          </span>

          <h1>
            Edita los detalles
            <br />

            <em>
              de tu inmueble.
            </em>
          </h1>

          <p>
            Actualiza la información,
            ubicación, fotografías y
            disponibilidad de tu propiedad.
          </p>

        </div>


        <div
          className="editar-encabezado-marca"
          aria-hidden="true"
        >
          HL
        </div>

      </section>


      <form
        className="editar-formulario"
        onSubmit={
          guardarCambios
        }
      >


        {/* 01 */}

        <section className="editar-seccion">

          <div className="editar-seccion-titulo">

            <span>
              01
            </span>

            <h2>
              Información básica
            </h2>

            <p>
              Actualiza los datos
              principales de tu propiedad.
            </p>

          </div>


          <div className="editar-seccion-contenido">

            <div className="editar-campo">

              <label>
                TÍTULO DE LA PROPIEDAD
              </label>

              <input
                name="titulo"
                type="text"
                value={
                  formulario.titulo
                }
                onChange={
                  cambiarCampo
                }
                required
              />

            </div>


            <div className="editar-grid">

              <div className="editar-campo">

                <label>
                  PRECIO MENSUAL (USD)
                </label>

                <input
                  name="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    formulario.precio
                  }
                  onChange={
                    cambiarCampo
                  }
                  required
                />

              </div>


              <div className="editar-campo">

                <label>
                  TIPO DE VIVIENDA
                </label>

                <select
                  name="tipo_vivienda"
                  value={
                    formulario.tipo_vivienda
                  }
                  onChange={
                    cambiarCampo
                  }
                  required
                >

                  <option value="">
                    Selecciona
                  </option>

                  <option value="Casa">
                    Casa
                  </option>

                  <option value="Apartamento">
                    Apartamento
                  </option>

                  <option value="Habitación">
                    Habitación
                  </option>

                  <option value="Local">
                    Local
                  </option>

                  <option value="Otro">
                    Otro
                  </option>

                </select>

              </div>

            </div>


            <div className="editar-grid editar-grid-tres">

              <div className="editar-campo">

                <label>
                  HABITACIONES
                </label>

                <input
                  name="habitaciones"
                  type="number"
                  min="0"
                  value={
                    formulario.habitaciones
                  }
                  onChange={
                    cambiarCampo
                  }
                  required
                />

              </div>


              <div className="editar-campo">

                <label>
                  BAÑOS
                </label>

                <input
                  name="banos"
                  type="number"
                  min="0"
                  value={
                    formulario.banos
                  }
                  onChange={
                    cambiarCampo
                  }
                  required
                />

              </div>


              <div className="editar-campo">

                <label>
                  ÁREA (M²)
                </label>

                <input
                  name="area"
                  type="number"
                  min="1"
                  step="0.01"
                  value={
                    formulario.area
                  }
                  onChange={
                    cambiarCampo
                  }
                  required
                />

              </div>

            </div>

          </div>

        </section>


        {/* 02 */}

        <section className="editar-seccion">

          <div className="editar-seccion-titulo">

            <span>
              02
            </span>

            <h2>
              Ubicación
            </h2>

            <p>
              Cambia la dirección o
              selecciona otra ubicación
              directamente en el mapa.
            </p>

          </div>


          <div className="editar-seccion-contenido">

            <div className="editar-campo">

              <label>
                DIRECCIÓN
              </label>

              <input
                name="direccion"
                type="text"
                value={
                  formulario.direccion
                }
                onChange={
                  cambiarCampo
                }
                required
              />

            </div>


            <div className="editar-mapa">

              <MapContainer
                center={centroMapa}
                zoom={
                  posicion
                    ? 16
                    : 13
                }
                scrollWheelZoom
                className="editar-mapa-leaflet"
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                <CentrarMapa
                  posicion={
                    posicion
                  }
                />


                <SelectorUbicacion
                  posicion={
                    posicion
                  }
                  onSeleccionar={
                    seleccionarUbicacion
                  }
                />

              </MapContainer>


              <div className="editar-mapa-info">

                <span>
                  UBICACIÓN SELECCIONADA
                </span>

                <p>

                  {coordenadasValidas
                    ? `${formulario.latitud} · ${formulario.longitud}`
                    : 'Haz clic en el mapa para seleccionar la ubicación.'}

                </p>

              </div>

            </div>

          </div>

        </section>


        {/* 03 */}

        <section className="editar-seccion">

          <div className="editar-seccion-titulo">

            <span>
              03
            </span>

            <h2>
              Fotografías
            </h2>

            <p>
              Cambia la portada,
              elimina fotografías o
              agrega nuevas imágenes.
            </p>

          </div>


          <div className="editar-seccion-contenido">


            {imagenesActuales.length >
              0 && (

              <div className="editar-fotos-bloque">

                <div className="editar-fotos-subtitulo">

                  <span>
                    FOTOGRAFÍAS ACTUALES
                  </span>

                  <small>
                    {imagenesActuales.length}
                    {' / 8'}
                  </small>

                </div>


                <div className="editar-fotos-grid">

                  {imagenesActuales.map(
                    (
                      imagen,
                      indice
                    ) => (

                      <div
                        className="editar-foto"
                        key={
                          imagen.id ||
                          indice
                        }
                      >

                        <img
                          src={
                            imagen.url_imagen
                          }
                          alt={`Fotografía ${indice + 1}`}
                        />


                        {Boolean(
                          imagen.es_principal
                        ) && (

                          <span className="editar-foto-principal">
                            PORTADA
                          </span>

                        )}


                        <div className="editar-foto-acciones">

                          {!Boolean(
                            imagen.es_principal
                          ) && (

                            <button
                              type="button"
                              disabled={
                                procesandoImagen
                              }
                              onClick={() =>
                                establecerPortada(
                                  imagen
                                )
                              }
                            >
                              Usar como portada
                            </button>

                          )}


                          <button
                            type="button"
                            className="eliminar"
                            disabled={
                              procesandoImagen
                            }
                            onClick={() =>
                              setImagenEliminar(
                                imagen
                              )
                            }
                          >
                            Eliminar
                          </button>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}


            <div className="editar-subir">

              <input
                id="editar-imagenes"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={
                  seleccionarImagenes
                }
              />


              <label htmlFor="editar-imagenes">

                <span className="editar-subir-simbolo">
                  +
                </span>

                <strong>
                  Agregar fotografías
                </strong>

                <small>
                  JPG, PNG o WEBP · máximo
                  5 MB · hasta 8 fotografías
                </small>

              </label>

            </div>


            {previsualizaciones.length >
              0 && (

              <div className="editar-fotos-bloque">

                <div className="editar-fotos-subtitulo">

                  <span>
                    NUEVAS FOTOGRAFÍAS
                  </span>

                  <small>
                    {previsualizaciones.length}
                  </small>

                </div>


                <div className="editar-fotos-grid">

                  {previsualizaciones.map(
                    (
                      url,
                      indice
                    ) => (

                      <div
                        className="editar-foto"
                        key={url}
                      >

                        <img
                          src={url}
                          alt={`Nueva fotografía ${indice + 1}`}
                        />


                        <button
                          type="button"
                          className="editar-quitar-nueva"
                          onClick={() =>
                            quitarImagenNueva(
                              indice
                            )
                          }
                        >
                          ×
                        </button>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

          </div>

        </section>


        {/* 04 */}

        <section className="editar-seccion">

          <div className="editar-seccion-titulo">

            <span>
              04
            </span>

            <h2>
              Descripción
            </h2>

            <p>
              Actualiza la descripción
              y los detalles principales.
            </p>

          </div>


          <div className="editar-seccion-contenido">

            <div className="editar-campo">

              <label>
                DESCRIPCIÓN DEL INMUEBLE
              </label>

              <textarea
                name="descripcion"
                rows="8"
                value={
                  formulario.descripcion
                }
                onChange={
                  cambiarCampo
                }
                required
              />

            </div>

          </div>

        </section>


        {/* 05 */}

        <section className="editar-seccion">

          <div className="editar-seccion-titulo">

            <span>
              05
            </span>

            <h2>
              Disponibilidad
            </h2>

            <p>
              Indica el estado actual
              de la propiedad.
            </p>

          </div>


          <div className="editar-seccion-contenido">

            <div className="editar-estados">


              <label
                className={
                  formulario.estado ===
                  'disponible'
                    ? 'activo'
                    : ''
                }
              >

                <input
                  type="radio"
                  name="estado"
                  value="disponible"
                  checked={
                    formulario.estado ===
                    'disponible'
                  }
                  onChange={
                    cambiarCampo
                  }
                />

                <span>
                  01
                </span>

                <div>

                  <strong>
                    Disponible
                  </strong>

                  <p>
                    La propiedad continúa
                    disponible para alquiler.
                  </p>

                </div>

              </label>


              <label
                className={
                  formulario.estado ===
                  'alquilado'
                    ? 'activo'
                    : ''
                }
              >

                <input
                  type="radio"
                  name="estado"
                  value="alquilado"
                  checked={
                    formulario.estado ===
                    'alquilado'
                  }
                  onChange={
                    cambiarCampo
                  }
                />

                <span>
                  02
                </span>

                <div>

                  <strong>
                    Alquilado
                  </strong>

                  <p>
                    La propiedad ya
                    se encuentra alquilada.
                  </p>

                </div>

              </label>

            </div>

          </div>

        </section>


        {error && (

          <div className="editar-mensaje error">
            {error}
          </div>

        )}


        {mensaje && (

          <div className="editar-mensaje exito">
            {mensaje}
          </div>

        )}


        <div className="editar-acciones-finales">

          <Link to="/dashboard">
            Cancelar
          </Link>


          <button
            type="submit"
            disabled={
              guardando ||
              procesandoImagen
            }
          >

            {guardando
              ? 'Guardando cambios...'
              : 'Guardar cambios'}

            {!guardando && (
              <span>
                →
              </span>
            )}

          </button>

        </div>

      </form>


      {/* MODAL ELIMINAR FOTO */}

      {imagenEliminar && (

        <div className="editar-modal-fondo">

          <div className="editar-modal">

            <span className="editar-modal-eyebrow">
              ELIMINAR FOTOGRAFÍA
            </span>


            <h2>
              ¿Eliminar esta
              fotografía?
            </h2>


            <div className="editar-modal-preview">

              <img
                src={
                  imagenEliminar.url_imagen
                }
                alt="Fotografía a eliminar"
              />

            </div>


            <p>
              La fotografía se eliminará
              permanentemente de esta
              propiedad.
            </p>


            <div className="editar-modal-acciones">

              <button
                type="button"
                disabled={
                  procesandoImagen
                }
                onClick={() =>
                  setImagenEliminar(
                    null
                  )
                }
              >
                Cancelar
              </button>


              <button
                type="button"
                className="eliminar"
                disabled={
                  procesandoImagen
                }
                onClick={
                  eliminarImagenActual
                }
              >

                {procesandoImagen
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


export default EditarInmueble