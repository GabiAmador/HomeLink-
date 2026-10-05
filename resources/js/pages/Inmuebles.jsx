import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerInmuebles } from '../services/api'
import {
  obtenerToken,
  obtenerUsuarioGuardado,
} from '../services/auth'


function Inmuebles() {

  const [inmuebles, setInmuebles] =
    useState([])

  const [cargando, setCargando] =
    useState(true)

  const [error, setError] =
    useState('')


  /* =========================================
     FILTROS
  ========================================= */

  const [ubicacion, setUbicacion] =
    useState('')

  const [tipo, setTipo] =
    useState('')

  const [precioMaximo, setPrecioMaximo] =
    useState('')

  const [habitaciones, setHabitaciones] =
    useState('')

  const [orden, setOrden] =
    useState('recientes')


  /* =========================================
     FAVORITOS
  ========================================= */

  const [favoritos, setFavoritos] =
    useState([])

  const [procesandoFavorito, setProcesandoFavorito] =
    useState(null)

  const [mensajeFavorito, setMensajeFavorito] =
    useState('')


  const usuario =
    obtenerUsuarioGuardado()

  const token =
    obtenerToken()


  /* =========================================
     CARGAR PROPIEDADES
  ========================================= */

  useEffect(() => {

    obtenerInmuebles()
      .then((datos) => {

        setInmuebles(
          Array.isArray(datos)
            ? datos
            : []
        )

        setCargando(false)

      })
      .catch((error) => {

        console.error(error)

        setError(
          'No se pudieron cargar las propiedades.'
        )

        setCargando(false)

      })

  }, [])


  /* =========================================
     CARGAR FAVORITOS DEL USUARIO
  ========================================= */

  useEffect(() => {

    if (!usuario || !token) {
      return
    }

    cargarFavoritos()

  }, [])


  async function cargarFavoritos() {

    try {

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
        return
      }


      const datos =
        await respuesta.json()


      if (!Array.isArray(datos)) {
        return
      }


      const ids =
        datos
          .map(
            (favorito) =>
              Number(
                favorito.inmueble_id
              )
          )
          .filter(Boolean)


      setFavoritos(ids)

    } catch (error) {

      console.error(
        'No se pudieron cargar los favoritos:',
        error
      )

    }

  }


  /* =========================================
     COMPROBAR FAVORITO
  ========================================= */

  function esFavorito(inmuebleId) {

    return favoritos.includes(
      Number(inmuebleId)
    )

  }


  /* =========================================
     GUARDAR / QUITAR FAVORITO
  ========================================= */

  async function cambiarFavorito(
    evento,
    inmueble
  ) {

    evento.preventDefault()
    evento.stopPropagation()


    /*
     * Si no existe una sesión,
     * no intentamos llamar al backend.
     */

    if (!usuario || !token) {

      mostrarMensajeFavorito(
        'Inicia sesión para guardar propiedades.'
      )

      return
    }


    const inmuebleId =
      Number(inmueble.id)

    const guardado =
      esFavorito(inmuebleId)


    try {

      setProcesandoFavorito(
        inmuebleId
      )


      const respuesta =
        await fetch(
          `/api/inmuebles/${inmuebleId}/favorito`,
          {
            method:
              guardado
                ? 'DELETE'
                : 'POST',

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
          'No fue posible actualizar tus favoritos.'
        )

      }


      if (guardado) {

        setFavoritos(
          (anteriores) =>
            anteriores.filter(
              (id) =>
                id !== inmuebleId
            )
        )


        mostrarMensajeFavorito(
          'Propiedad eliminada de favoritos.'
        )

      } else {

        setFavoritos(
          (anteriores) => {

            if (
              anteriores.includes(
                inmuebleId
              )
            ) {
              return anteriores
            }

            return [
              ...anteriores,
              inmuebleId,
            ]

          }
        )


        mostrarMensajeFavorito(
          'Propiedad guardada en favoritos.'
        )

      }

    } catch (error) {

      console.error(error)

      mostrarMensajeFavorito(
        error.message ||
        'No fue posible actualizar tus favoritos.'
      )

    } finally {

      setProcesandoFavorito(null)

    }

  }


  /* =========================================
     NOTIFICACIÓN FAVORITO
  ========================================= */

  function mostrarMensajeFavorito(
    texto
  ) {

    setMensajeFavorito(texto)


    setTimeout(() => {

      setMensajeFavorito('')

    }, 3000)

  }


  /* =========================================
     RESULTADOS Y FILTROS
  ========================================= */

  const resultados =
    useMemo(() => {

      let lista =
        inmuebles.filter(
          (inmueble) => {

            const coincideUbicacion =
              !ubicacion ||
              inmueble.direccion
                ?.toLowerCase()
                .includes(
                  ubicacion.toLowerCase()
                )


            const coincideTipo =
              !tipo ||
              inmueble.tipo_vivienda
                ?.toLowerCase() ===
                tipo.toLowerCase()


            const coincidePrecio =
              !precioMaximo ||
              Number(
                inmueble.precio
              ) <=
                Number(
                  precioMaximo
                )


            const coincideHabitaciones =
              !habitaciones ||
              Number(
                inmueble.habitaciones
              ) >=
                Number(
                  habitaciones
                )


            return (
              coincideUbicacion &&
              coincideTipo &&
              coincidePrecio &&
              coincideHabitaciones
            )

          }
        )


      lista = [...lista]


      if (
        orden ===
        'precio-menor'
      ) {

        lista.sort(
          (a, b) =>
            Number(a.precio) -
            Number(b.precio)
        )

      }


      if (
        orden ===
        'precio-mayor'
      ) {

        lista.sort(
          (a, b) =>
            Number(b.precio) -
            Number(a.precio)
        )

      }


      if (
        orden ===
        'recientes'
      ) {

        lista.sort(
          (a, b) =>
            Number(b.id) -
            Number(a.id)
        )

      }


      return lista

    }, [
      inmuebles,
      ubicacion,
      tipo,
      precioMaximo,
      habitaciones,
      orden,
    ])


  function limpiarFiltros() {

    setUbicacion('')
    setTipo('')
    setPrecioMaximo('')
    setHabitaciones('')
    setOrden('recientes')

  }


  /* =========================================
     RENDER
  ========================================= */

  return (

    <main className="propiedades-page">


      {/* =========================================
          ENCABEZADO DE PROPIEDADES
      ========================================= */}

      <section className="propiedades-encabezado">

        <div className="propiedades-hojas" />

        <div className="propiedades-hojas-derecha" />


        <div className="propiedades-encabezado-contenido">

          <h1>
            Propiedades
          </h1>

          <p>
            Encuentra el lugar perfecto para ti.
          </p>

        </div>

      </section>


      {/* =========================================
          BUSCADOR Y FILTROS
      ========================================= */}

      <section className="propiedades-buscador">

        <div className="propiedades-filtros">


          {/* UBICACIÓN */}

          <div className="propiedades-campo">

            <label>
              Ubicación
            </label>

            <input
              type="text"
              placeholder="Ej. Jinotega"
              value={ubicacion}
              onChange={(e) =>
                setUbicacion(
                  e.target.value
                )
              }
            />

          </div>


          {/* TIPO */}

          <div className="propiedades-campo">

            <label>
              Tipo
            </label>

            <select
              value={tipo}
              onChange={(e) =>
                setTipo(
                  e.target.value
                )
              }
            >

              <option value="">
                Todos
              </option>

              <option value="Casa">
                Casa
              </option>

              <option value="Apartamento">
                Apartamento
              </option>

            </select>

          </div>


          {/* PRECIO */}

          <div className="propiedades-campo">

            <label>
              Precio máximo
            </label>

            <input
              type="number"
              min="0"
              placeholder="$500"
              value={precioMaximo}
              onChange={(e) =>
                setPrecioMaximo(
                  e.target.value
                )
              }
            />

          </div>


          {/* HABITACIONES */}

          <div className="propiedades-campo">

            <label>
              Habitaciones
            </label>

            <select
              value={habitaciones}
              onChange={(e) =>
                setHabitaciones(
                  e.target.value
                )
              }
            >

              <option value="">
                Todas
              </option>

              <option value="1">
                1+
              </option>

              <option value="2">
                2+
              </option>

              <option value="3">
                3+
              </option>

              <option value="4">
                4+
              </option>

            </select>

          </div>


          {/* BOTÓN */}

          <button
            type="button"
            className="propiedades-btn-buscar"
          >
            BUSCAR
          </button>

        </div>

      </section>


      {/* =========================================
          CATÁLOGO
      ========================================= */}

      <section className="propiedades-catalogo">


        {/* BARRA DE RESULTADOS */}

        <div className="propiedades-barra">

          <div className="propiedades-resultados">

            <strong>
              {resultados.length}
            </strong>

            <span>

              {resultados.length === 1
                ? ' resultado'
                : ' resultados'}

            </span>

          </div>


          {/* ORDENAR */}

          <div className="propiedades-ordenar">

            <label htmlFor="ordenar">
              Ordenar por
            </label>

            <select
              id="ordenar"
              value={orden}
              onChange={(e) =>
                setOrden(
                  e.target.value
                )
              }
            >

              <option value="recientes">
                Más recientes
              </option>

              <option value="precio-menor">
                Menor precio
              </option>

              <option value="precio-mayor">
                Mayor precio
              </option>

            </select>

          </div>

        </div>


        {/* =========================================
            ESTADOS
        ========================================= */}

        {cargando && (

          <div className="propiedades-mensaje">
            Cargando propiedades...
          </div>

        )}


        {error && (

          <div className="propiedades-mensaje propiedades-error">
            {error}
          </div>

        )}


        {!cargando &&
          !error &&
          resultados.length === 0 && (

            <div className="propiedades-vacio">

              <span>
                HOMELINK
              </span>

              <h2>
                No encontramos propiedades
              </h2>

              <p>
                Intenta cambiar los filtros de búsqueda.
              </p>

              <button
                type="button"
                onClick={
                  limpiarFiltros
                }
              >
                Limpiar filtros
              </button>

            </div>

          )}


        {/* =========================================
            GRID DE PROPIEDADES
        ========================================= */}

        {!cargando &&
          !error &&
          resultados.length > 0 && (

            <div className="propiedades-grid">

              {resultados.map(
                (inmueble) => {

                  const imagen =
                    inmueble.imagenes
                      ?.length > 0
                      ? inmueble
                          .imagenes[0]
                          .url_imagen
                      : null


                  const guardado =
                    esFavorito(
                      inmueble.id
                    )


                  const procesando =
                    procesandoFavorito ===
                    Number(
                      inmueble.id
                    )


                  return (

                    <article
                      className="propiedad-card"
                      key={inmueble.id}
                    >


                      {/* ===============================
                          IMAGEN
                      =============================== */}

                      <div className="propiedad-card-imagen-wrapper">

                        <Link
                          to={`/inmuebles/${inmueble.id}`}
                          className="propiedad-card-imagen"
                        >

                          {imagen ? (

                            <>

                              <img
                                src={imagen}
                                alt={
                                  inmueble.titulo
                                }
                                onError={(e) => {

                                  e.currentTarget.style.display =
                                    'none'

                                  const placeholder =
                                    e.currentTarget
                                      .nextElementSibling

                                  if (
                                    placeholder
                                  ) {

                                    placeholder
                                      .classList
                                      .add(
                                        'mostrar'
                                      )

                                  }

                                }}
                              />


                              <div className="propiedad-card-placeholder">

                                <span className="placeholder-icono">
                                  ◇
                                </span>

                                <strong>
                                  HomeLink
                                  <span>.</span>
                                </strong>

                                <small>
                                  Fotografía no disponible
                                </small>

                              </div>

                            </>

                          ) : (

                            <div className="propiedad-card-placeholder mostrar">

                              <span className="placeholder-icono">
                                ◇
                              </span>

                              <strong>
                                HomeLink
                                <span>.</span>
                              </strong>

                              <small>
                                Fotografía no disponible
                              </small>

                            </div>

                          )}


                          {/* ESTADO */}

                          <span className="propiedad-card-estado">

                            {inmueble.estado}

                          </span>

                        </Link>


                        {/* FAVORITO */}

                        <button
                          type="button"
                          className={
                            `propiedad-card-favorito ${
                              guardado
                                ? 'activo'
                                : ''
                            }`
                          }
                          onClick={(evento) =>
                            cambiarFavorito(
                              evento,
                              inmueble
                            )
                          }
                          disabled={
                            procesando
                          }
                          aria-label={
                            guardado
                              ? `Quitar ${inmueble.titulo} de favoritos`
                              : `Guardar ${inmueble.titulo} en favoritos`
                          }
                          title={
                            usuario
                              ? (
                                guardado
                                  ? 'Quitar de favoritos'
                                  : 'Guardar en favoritos'
                              )
                              : 'Inicia sesión para guardar'
                          }
                        >

                          {procesando
                            ? '·'
                            : guardado
                              ? '♥'
                              : '♡'}

                        </button>

                      </div>


                      {/* ===============================
                          INFORMACIÓN
                      =============================== */}

                      <div className="propiedad-card-contenido">


                        {/* TIPO */}

                        <span className="propiedad-card-tipo">

                          {inmueble.tipo_vivienda}

                        </span>


                        {/* TÍTULO */}

                        <Link
                          to={`/inmuebles/${inmueble.id}`}
                          className="propiedad-card-titulo"
                        >

                          {inmueble.titulo}

                        </Link>


                        {/* DIRECCIÓN */}

                        <p className="propiedad-card-ubicacion">

                          {inmueble.direccion}

                        </p>


                        {/* PRECIO */}

                        <div className="propiedad-card-precio">

                          <strong>

                            $
                            {Number(
                              inmueble.precio
                            ).toFixed(0)}

                          </strong>

                          <span>
                            / mes
                          </span>

                        </div>


                        {/* ===============================
                            DATOS INFERIORES
                        =============================== */}

                        <div className="propiedad-card-datos">

                          <div className="propiedad-card-caracteristicas">

                            <span>

                              {inmueble.habitaciones}
                              {' '}
                              hab.

                            </span>

                            <span>

                              {inmueble.banos}
                              {' '}
                              baños

                            </span>

                          </div>


                          {/* FLECHA CIRCULAR */}

                          <Link
                            to={`/inmuebles/${inmueble.id}`}
                            className="propiedad-card-flecha"
                            aria-label={
                              `Ver ${inmueble.titulo}`
                            }
                          >
                            ↗
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


      {/* =========================================
          NOTIFICACIÓN FAVORITOS
      ========================================= */}

      {mensajeFavorito && (

        <div className="propiedades-favorito-notificacion">

          <span>
            HOMELINK
          </span>

          <p>
            {mensajeFavorito}
          </p>

        </div>

      )}

    </main>

  )

}


export default Inmuebles