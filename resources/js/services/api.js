const API_URL = '/api'

export async function obtenerInmuebles() {
  const respuesta = await fetch(`${API_URL}/inmuebles`)

  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener los inmuebles')
  }

  return respuesta.json()
}

export async function obtenerInmueble(id) {
  const respuesta = await fetch(`${API_URL}/inmuebles/${id}`)

  if (!respuesta.ok) {
    throw new Error('No se pudo obtener el inmueble')
  }

  return respuesta.json()
}