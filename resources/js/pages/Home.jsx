import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerInmuebles } from '../services/api'

function Home() {
  const [inmuebles, setInmuebles] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerInmuebles()
      .then((datos) => {
        setInmuebles(datos)
        setCargando(false)
      })
      .catch((error) => {
        console.error(error)
        setCargando(false)
      })
  }, [])

  const propiedades = inmuebles.slice(0, 3)

  const destacada =
    inmuebles.find(
      (item) => item.imagenes?.length > 0
    ) || inmuebles[0]

  return (
    <main className="hl-page">

      {/* HERO */}

      <section className="hl-hero">

        <div className="hl-hero-inner">

          <div className="hl-eyebrow">
            HomeLink Signature Collection
          </div>

          <h1>
            Donde la elegancia
            <br />
            encuentra
            <em>tu hogar.</em>
          </h1>

          <p className="hl-hero-description">
            Descubre propiedades cuidadosamente seleccionadas
            en Jinotega y encuentra un espacio que realmente
            se adapte a tu forma de vivir.
          </p>

          <div className="hl-hero-actions">

            <Link
              to="/inmuebles"
              className="hl-button-light"
            >
              Explorar colección
              <span>↗</span>
            </Link>

            <Link
              to="/publicar"
              className="hl-button-outline"
            >
              Publicar propiedad
            </Link>

          </div>


          {/* TARJETA DESTACADA */}

          {destacada && (

            <article className="hl-featured-card">

              <div className="hl-card-top">

                <span>
                  Propiedad · 01
                </span>

                <small className="hl-card-status">
                  {destacada.estado}
                </small>

              </div>

              <h3>
                {destacada.titulo}
              </h3>

              <p>
                {destacada.direccion}
              </p>

              <div className="hl-featured-data">

                <div>
                  <strong>
                    {destacada.habitaciones}
                  </strong>

                  <small>
                    Habitaciones
                  </small>
                </div>

                <div>
                  <strong>
                    {destacada.banos}
                  </strong>

                  <small>
                    Baños
                  </small>
                </div>

                <div>
                  <strong>
                    ${Number(destacada.precio).toFixed(0)}
                  </strong>

                  <small>
                    Por mes
                  </small>
                </div>

              </div>

              <Link
                to={`/inmuebles/${destacada.id}`}
                className="hl-featured-link"
              >
                Ver propiedad
                <span>→</span>
              </Link>

            </article>

          )}

        </div>

        <div className="hl-scroll">
          Scroll
        </div>

      </section>


      {/* INTRO */}

      <section className="hl-intro" id="nosotros">

        <div className="hl-intro-inner">

          <span className="hl-mini-title">
            Experiencia HomeLink
          </span>

          <h2>
            Una nueva forma de encontrar
            <em> dónde vivir.</em>
          </h2>

          <p>
            Conectamos personas con propietarios de una manera
            directa y sencilla, combinando información clara,
            fotografías y espacios pensados para cada estilo
            de vida.
          </p>

        </div>

      </section>


      {/* PROPIEDADES */}

      <section className="hl-properties">

        <div className="hl-properties-inner">

          <div className="hl-section-heading">

            <div>

              <span className="hl-mini-title">
                Propiedades seleccionadas
              </span>

              <h2>
                Residencias que
                <br />
                inspiran.
              </h2>

            </div>

            <Link to="/inmuebles">
              Explorar todas →
            </Link>

          </div>


          {cargando ? (

            <p>
              Cargando propiedades...
            </p>

          ) : (

            <div className="hl-property-grid">

              {propiedades.map(
                (inmueble, indice) => (

                  <article
                    className="hl-property"
                    key={inmueble.id}
                  >

                    <div className="hl-property-image">

                      {inmueble.imagenes?.length > 0 ? (

                        <img
                          src={
                            inmueble.imagenes[0]
                              .url_imagen
                          }
                          alt={inmueble.titulo}
                        />

                      ) : (

                        <img
                          src="/images/casa1.jpg"
                          alt="Casa HomeLink"
                        />

                      )}

                      <span className="hl-property-index">
                        0{indice + 1}
                      </span>

                      <span className="hl-property-state">
                        {inmueble.estado}
                      </span>

                    </div>

                    <div className="hl-property-body">

                      <span className="hl-property-category">
                        {inmueble.tipo_vivienda}
                      </span>

                      <div className="hl-property-title-row">

                        <h3>
                          {inmueble.titulo}
                        </h3>

                        <div className="hl-property-price">

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

                      </div>

                      <p className="hl-property-address">
                        {inmueble.direccion}
                      </p>

                      <div className="hl-property-footer">

                        <span>
                          {inmueble.habitaciones}
                          {' '}habitaciones
                        </span>

                        <span>
                          {inmueble.banos}
                          {' '}baños
                        </span>

                        <Link
                          to={`/inmuebles/${inmueble.id}`}
                        >
                          ↗
                        </Link>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </div>

      </section>


      {/* EDITORIAL */}

      <section className="hl-editorial">

        <div className="hl-editorial-image"></div>

        <div className="hl-editorial-content">

          <span className="hl-mini-title">
            Nuestra filosofía
          </span>

          <h2>
            No encontramos
            casas.
            <br />
            Encontramos
            <em> posibilidades.</em>
          </h2>

          <p>
            Un espacio puede convertirse en el comienzo de una
            nueva etapa. HomeLink busca hacer ese proceso más
            simple, visual y cercano.
          </p>

          <Link
            to="/inmuebles"
            className="hl-editorial-link"
          >
            Descubrir propiedades →
          </Link>

        </div>

      </section>


      {/* CATEGORÍAS */}

      <section className="hl-categories">

        <div className="hl-categories-inner">

          <span className="hl-mini-title">
            Explora HomeLink
          </span>

          <h2>
            Encuentra el espacio
            que buscas.
          </h2>

          <div className="hl-category-list">

            <Link
              to="/inmuebles"
              className="hl-category-item"
            >

              <span className="hl-category-number">
                01
              </span>

              <div>

                <h3>
                  Casas
                </h3>

                <p>
                  Espacios amplios para compartir
                  y construir nuevas historias.
                </p>

              </div>

              <span>
                ↗
              </span>

            </Link>


            <Link
              to="/inmuebles"
              className="hl-category-item"
            >

              <span className="hl-category-number">
                02
              </span>

              <div>

                <h3>
                  Apartamentos
                </h3>

                <p>
                  Practicidad y comodidad para
                  un estilo de vida moderno.
                </p>

              </div>

              <span>
                ↗
              </span>

            </Link>


            <Link
              to="/inmuebles"
              className="hl-category-item"
            >

              <span className="hl-category-number">
                03
              </span>

              <div>

                <h3>
                  Disponibles ahora
                </h3>

                <p>
                  Propiedades listas para encontrar
                  a su próximo inquilino.
                </p>

              </div>

              <span>
                ↗
              </span>

            </Link>

          </div>

        </div>

      </section>


      {/* CTA */}

      <section className="hl-cta">

        <span className="hl-mini-title">
          Propietarios
        </span>

        <h2>
          Tu propiedad puede ser
          el próximo hogar de alguien.
        </h2>

        <Link
          to="/publicar"
          className="hl-cta-button"
        >
          Publicar propiedad
          <span>↗</span>
        </Link>

      </section>


      {/* FOOTER */}

      <footer className="hl-footer" id="contacto">

        <div className="hl-footer-brand">

          <h2>
            HomeLink.
          </h2>

          <p>
            Una plataforma para encontrar espacios,
            conectar personas y descubrir nuevas
            posibilidades.
          </p>

        </div>

        <div className="hl-footer-column">

          <span className="hl-footer-title">
            Navegación
          </span>

          <Link to="/">
            Inicio
          </Link>

          <Link to="/inmuebles">
            Propiedades
          </Link>

          <Link to="/publicar">
            Publicar
          </Link>

        </div>

        <div className="hl-footer-column">

          <span className="hl-footer-title">
            Cuenta
          </span>

          <Link to="/login">
            Iniciar sesión
          </Link>

          <Link to="/registro">
            Crear cuenta
          </Link>

        </div>

        <div className="hl-footer-column">

          <span className="hl-footer-title">
            Ubicación
          </span>

          <p>
            Jinotega, Nicaragua
          </p>

          <p>
            HomeLink
          </p>

        </div>

      </footer>

    </main>
  )
}

export default Home