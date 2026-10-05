import { useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  iniciarSesion,
  guardarSesion,
} from '../services/auth'


function Login() {

  const navigate =
    useNavigate()

  const [
    formulario,
    setFormulario,
  ] = useState({
    email: '',
    password: '',
  })

  const [
    mostrarPassword,
    setMostrarPassword,
  ] = useState(false)

  const [error, setError] =
    useState('')

  const [cargando, setCargando] =
    useState(false)


  function cambiarCampo(e) {

    const {
      name,
      value,
    } = e.target

    setFormulario(
      (anterior) => ({
        ...anterior,
        [name]: value,
      })
    )

    if (error) {
      setError('')
    }

  }


  async function entrar(e) {

    e.preventDefault()

    const email =
      formulario.email.trim()

    const password =
      formulario.password

    if (!email || !password) {

      setError(
        'Completa tu correo y contraseña.'
      )

      return
    }


    try {

      setError('')
      setCargando(true)

      const resultado =
        await iniciarSesion({
          email,
          password,
        })


      guardarSesion(
        resultado.usuario,
        resultado.token
      )


      /*
       * HomeLink utiliza una sola cuenta.
       *
       * Ya no redirigimos según propietario
       * o inquilino.
       */

      navigate('/dashboard', {
        replace: true,
      })

    } catch (error) {

      const primerError =
        error?.errors
          ? Object.values(
            error.errors
          )?.[0]?.[0]
          : error?.message


      setError(
        primerError ||
        'Correo o contraseña incorrectos.'
      )

    } finally {

      setCargando(false)

    }

  }


  return (

    <main className="auth-pagina">

      <section className="auth-card">


        <div className="auth-cabecera">

          <p>
            HOMELINK
          </p>

          <h1>
            Bienvenida de nuevo
          </h1>

          <span>
            Inicia sesión para explorar,
            guardar y publicar propiedades
            desde una sola cuenta.
          </span>

        </div>


        <form
          className="auth-form"
          onSubmit={entrar}
        >


          <div className="campo">

            <label
              htmlFor="login-email"
            >
              Correo electrónico
            </label>

            <input
              id="login-email"
              type="email"
              name="email"
              value={
                formulario.email
              }
              onChange={
                cambiarCampo
              }
              autoComplete="email"
              placeholder="tu@correo.com"
              disabled={cargando}
              required
            />

          </div>


          <div className="campo">

            <label
              htmlFor="login-password"
            >
              Contraseña
            </label>


            <div className="auth-password">

              <input
                id="login-password"
                type={
                  mostrarPassword
                    ? 'text'
                    : 'password'
                }
                name="password"
                value={
                  formulario.password
                }
                onChange={
                  cambiarCampo
                }
                autoComplete="current-password"
                placeholder="Tu contraseña"
                disabled={cargando}
                required
              />


              <button
                type="button"
                className="auth-password-ver"
                onClick={() =>
                  setMostrarPassword(
                    (actual) => !actual
                  )
                }
                aria-label={
                  mostrarPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
              >
                {mostrarPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.8 10.8 0 0112 4c5.5 0 9 5 9 5s-1.3 1.9-3.5 3.4M6.2 6.2C4.1 7.5 3 9 3 9s3.5 5 9 5c1.2 0 2.3-.2 3.3-.6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="2.2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                )}
              </button>

            </div>

          </div>


          {error && (

            <div
              className="mensaje-error"
              role="alert"
            >
              {error}
            </div>

          )}


          <button
            type="submit"
            className="auth-boton"
            disabled={cargando}
          >

            {cargando
              ? 'Ingresando...'
              : 'Iniciar sesión'}

          </button>

        </form>


        <div className="auth-separador">

          <span />

          <small>
            TU ESPACIO HOMELINK
          </small>

          <span />

        </div>


        <p className="auth-link">

          ¿Todavía no tienes cuenta?{' '}

          <Link to="/registro">
            Crear cuenta
          </Link>

        </p>


        <Link
          to="/inmuebles"
          className="auth-volver"
        >
          ← Explorar propiedades
        </Link>


      </section>

    </main>

  )

}

export default Login