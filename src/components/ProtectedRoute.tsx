import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminSession } from '../hooks/useAuth'
import { FullPageLoader } from './States'

export function ProtectedRoute() {
  const location = useLocation()
  const session = useAdminSession()

  if (session.isLoading) {
    return <FullPageLoader label="Validando acesso seguro..." />
  }

  if (!session.data?.authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
