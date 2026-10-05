import { useState } from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  registrarUsuario,
  guardarSesion,
} from '../services/auth'


function Registro() {

  const navigate =
    useNavigate()


  /* ======================================================
     FORMULARIO
  ====================================================== */

  const [
    formulario,
    setFormulario,
  ] = useState({
    name: '',
    email: '',
    telefono: '',
    password: '',
    password_confirmation: '',
  })


  /* ======================================================
     MOSTRAR / OCULTAR CONTRASEÑAS
  ====================================================== */

  const [
    mostrarPassword,
    setMostrarPassword,
  ] = useState(false)


  const [
    mostrarConfirmacion,
    setMostrarConfirmacion,
  ] = useState(false)


  /* ======================================================
     ESTADOS
  ====================================================== */

  const [
    error,
    setError,
  ] = useState('')


  const [
    cargando,
    setCargando,
  ] = useState(false)


  /* ======================================================
     CAMBIAR CAMPOS
  ====================================================== */

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


  /* ======================================================
     REGISTRAR USUARIO
  ====================================================== */

  async function registrar(e) {

    e.preventDefault()


    const nombre =
      formulario.name.trim()

    const email =
      formulario.email.trim()

    const telefono =
      formulario.telefono.trim()

    const password =
      formulario.password

    const confirmacion =
      formulario.password_confirmation


    /* VALIDAR CAMPOS */

    if (
      !nombre ||
      !email ||
      !password ||
      !confirmacion
    ) {

      setError(
        'Completa todos los campos obligatorios.'
      )

      return

    }


    /* VALIDAR CONTRASEÑA */

    if (
      password.length < 8
    ) {

      setError(
        'La contraseña debe tener al menos 8 caracteres.'
      )

      return

    }


    /* VALIDAR CONFIRMACIÓN */

    if (
      password !==
      confirmacion
    ) {

      setError(
        'Las contraseñas no coinciden.'
      )

      return

    }


    try {

      setError('')
      setCargando(true)


      const resultado =
        await registrarUsuario({

          name:
            nombre,

          email,

          telefono:
            telefono || null,

          password,

          password_confirmation:
            confirmacion,

        })


      /* GUARDAR SESIÓN */

      guardarSesion(
        resultado.usuario,
        resultado.token
      )


      /*
       * Una cuenta HomeLink permite:
       *
       * - Buscar propiedades
       * - Guardar favoritos
       * - Contactar propietarios
       * - Publicar propiedades
       * - Administrar inmuebles
       */


      navigate(
        '/dashboard',
        {
          replace: true,
        }
      )


    } catch (error) {

      const primerError =
        error?.errors
          ? Object.values(
              error.errors
            )?.[0]?.[0]
          : error?.message


      setError(
        primerError ||
        'No se pudo completar el registro.'
      )


    } finally {

      setCargando(false)

    }

  }


  /* ======================================================
     INTERFAZ
  ====================================================== */

  return (

    <main className="auth-pagina">


      <section className="auth-card">


        {/* ===============================================
            CABECERA
        =============================================== */}

        <div className="auth-cabecera">

          <p>
            HOMELINK
          </p>


          <h1>
            Crea tu cuenta
          </h1>


          <span>
            Una sola cuenta para encontrar,
            guardar y publicar propiedades.
          </span>

        </div>


        {/* ===============================================
            FORMULARIO
        =============================================== */}

        <form
          onSubmit={registrar}
          className="auth-form"
        >


          {/* NOMBRE */}

          <div className="campo">

            <label
              htmlFor="registro-name"
            >
              Nombre completo
            </label>


            <input
              id="registro-name"
              type="text"
              name="name"
              value={
                formulario.name
              }
              onChange={
                cambiarCampo
              }
              autoComplete="name"
              placeholder="Tu nombre"
              maxLength={255}
              disabled={
                cargando
              }
              required
            />

          </div>


          {/* CORREO */}

          <div className="campo">

            <label
              htmlFor="registro-email"
            >
              Correo electrónico
            </label>


            <input
              id="registro-email"
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
              maxLength={255}
              disabled={
                cargando
              }
              required
            />

          </div>


          {/* TELÉFONO */}

          <div className="campo">

            <label
              htmlFor="registro-telefono"
            >

              Teléfono

              <small>
                {' '}— opcional
              </small>

            </label>


            <input
              id="registro-telefono"
              type="tel"
              name="telefono"
              value={
                formulario.telefono
              }
              onChange={
                cambiarCampo
              }
              autoComplete="tel"
              placeholder="Ej. 8888 8888"
              disabled={
                cargando
              }
            />

          </div>


          {/* ===============================================
              CONTRASEÑA
          =============================================== */}

          <div className="campo">

            <label
              htmlFor="registro-password"
            >
              Contraseña
            </label>


            <div className="auth-password">


              <input
                id="registro-password"
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
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                disabled={
                  cargando
                }
                required
              />


              <button
                type="button"
                className="auth-password-ver"
                onClick={() =>
                  setMostrarPassword(
                    (actual) =>
                      !actual
                  )
                }
                aria-label={
                  mostrarPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
                title={
                  mostrarPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
              >


                {mostrarPassword ? (

                  /* OJO CERRADO */

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >

                    <path
                      d="
                        M3 3l18 18
                        M10.6 10.6a2 2 0 002.8 2.8
                        M9.9 4.2A10.8 10.8 0 0112 4
                        c5.5 0 9 5 9 5
                        s-1.3 1.9-3.5 3.4
                        M6.2 6.2
                        C4.1 7.5 3 9 3 9
                        s3.5 5 9 5
                        c1.2 0 2.3-.2 3.3-.6
                      "
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                  </svg>

                ) : (

                  /* OJO ABIERTO */

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >

                    <path
                      d="
                        M3 12
                        s3.5-5 9-5
                        9 5 9 5
                        -3.5 5-9 5
                        -9-5-9-5z
                      "
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


          {/* ===============================================
              CONFIRMAR CONTRASEÑA
          =============================================== */}

          <div className="campo">

            <label
              htmlFor="registro-confirmacion"
            >
              Confirmar contraseña
            </label>


            <div className="auth-password">


              <input
                id="registro-confirmacion"
                type={
                  mostrarConfirmacion
                    ? 'text'
                    : 'password'
                }
                name="password_confirmation"
                value={
                  formulario
                    .password_confirmation
                }
                onChange={
                  cambiarCampo
                }
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                minLength={8}
                disabled={
                  cargando
                }
                required
              />


              <button
                type="button"
                className="auth-password-ver"
                onClick={() =>
                  setMostrarConfirmacion(
                    (actual) =>
                      !actual
                  )
                }
                aria-label={
                  mostrarConfirmacion
                    ? 'Ocultar confirmación'
                    : 'Mostrar confirmación'
                }
                title={
                  mostrarConfirmacion
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
              >


                {mostrarConfirmacion ? (

                  /* OJO CERRADO */

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >

                    <path
                      d="
                        M3 3l18 18
                        M10.6 10.6a2 2 0 002.8 2.8
                        M9.9 4.2A10.8 10.8 0 0112 4
                        c5.5 0 9 5 9 5
                        s-1.3 1.9-3.5 3.4
                        M6.2 6.2
                        C4.1 7.5 3 9 3 9
                        s3.5 5 9 5
                        c1.2 0 2.3-.2 3.3-.6
                      "
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                  </svg>

                ) : (

                  /* OJO ABIERTO */

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >

                    <path
                      d="
                        M3 12
                        s3.5-5 9-5
                        9 5 9 5
                        -3.5 5-9 5
                        -9-5-9-5z
                      "
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


          {/* ===============================================
              ERROR
          =============================================== */}

          {error && (

            <div
              className="mensaje-error"
              role="alert"
            >
              {error}
            </div>

          )}


          {/* ===============================================
              BOTÓN CREAR CUENTA
          =============================================== */}

          <button
            type="submit"
            className="auth-boton"
            disabled={
              cargando
            }
          >

            {cargando
              ? 'Creando cuenta...'
              : 'Crear cuenta'}

          </button>


        </form>


        {/* ===============================================
            SEPARADOR
        =============================================== */}

        <div className="auth-separador">

          <span />

          <small>
            UNA CUENTA · TODO HOMELINK
          </small>

          <span />

        </div>


        {/* ===============================================
            LOGIN
        =============================================== */}

        <p className="auth-link">

          ¿Ya tienes una cuenta?{' '}

          <Link to="/login">
            Iniciar sesión
          </Link>

        </p>


        {/* ===============================================
            VOLVER A PROPIEDADES
        =============================================== */}

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


export default Registro