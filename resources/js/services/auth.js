const API_URL = '/api'

export async function registrarUsuario(datos) {
  const respuesta = await fetch(`${API_URL}/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(datos),
  })

  const resultado = await respuesta.json()

  if (!respuesta.ok) {
    throw resultado
  }

  return resultado
}

export async function iniciarSesion(datos) {
  const respuesta = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(datos),
  })

  const resultado = await respuesta.json()

  if (!respuesta.ok) {
    throw resultado
  }

  return resultado
}

export function guardarSesion(usuario, token) {
  localStorage.setItem(
    'usuario',
    JSON.stringify(usuario)
  )

  localStorage.setItem(
    'token',
    token
  )

  window.dispatchEvent(
    new Event('usuarioActualizado')
  )
}

export function obtenerUsuarioGuardado() {
  const usuario = localStorage.getItem('usuario')

  return usuario ? JSON.parse(usuario) : null
}

export function obtenerToken() {
  return localStorage.getItem('token')
}

export function cerrarSesionLocal() {
  localStorage.removeItem('usuario')
  localStorage.removeItem('token')

  window.dispatchEvent(
    new Event('usuarioActualizado')
  )
}