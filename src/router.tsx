import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { NewEventPage } from './pages/NewEventPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PedidosPage } from './pages/PedidosPage'
import { RefundsPage } from './pages/RefundsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: '/pedidos', element: <PedidosPage /> },
          { path: '/reembolsos', element: <RefundsPage /> },
          { path: '/novo-evento', element: <NewEventPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
