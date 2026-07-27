import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { sessionQueryKey, useAdminSession } from '../hooks/useAuth'
import { FullPageLoader } from './States'

export function ProtectedRoute() {
  const location = useLocation()
  const queryClient = useQueryClient()
  const session = useAdminSession()

  useEffect(() => {
    const handleUnauthorized = () => {
      queryClient.setQueryData(sessionQueryKey, { authenticated: false })
      queryClient.cancelQueries().catch(() => undefined)
    }
    window.addEventListener('admin:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('admin:unauthorized', handleUnauthorized)
  }, [queryClient])

  if (session.isLoading) {
    return <FullPageLoader label="Validando acesso seguro..." />
  }

  if (!session.data?.authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
