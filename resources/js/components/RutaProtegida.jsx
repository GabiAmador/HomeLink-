import { Navigate } from 'react-router-dom'
import { obtenerToken } from '../services/auth'

function RutaProtegida({ children }) {

  const token = obtenerToken()

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return children
}

export default RutaProtegida