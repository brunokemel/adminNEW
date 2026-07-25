import { CalendarClock, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminLogout } from '../hooks/useAuth'
import { formatDateTime } from '../utils/formatters'
import { Brand } from './Brand'

export interface HeaderContext {
  updatedAt?: string
  isFetching?: boolean
}

export function AppShell() {
  const navigate = useNavigate()
  const logout = useAdminLogout()
  const [menuOpen, setMenuOpen] = useState(false)
  const [headerContext, setHeaderContext] = useState<HeaderContext>({})

  async function handleLogout() {
    await logout.mutateAsync().catch(() => undefined)
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__inner">
          <Brand />

          <div className="topbar__status" aria-live="polite">
            <CalendarClock size={18} />
            <span>
              <small>Última atualização</small>
              <strong>
                {headerContext.isFetching
                  ? 'Atualizando...'
                  : formatDateTime(headerContext.updatedAt)}
              </strong>
            </span>
          </div>

          <button
            className="icon-button topbar__menu-button"
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <nav className={`topbar__nav ${menuOpen ? 'is-open' : ''}`}>
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              onClick={() => setMenuOpen(false)}
            >
              Painel
            </NavLink>
            <NavLink
              to="/pedidos"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              onClick={() => setMenuOpen(false)}
            >
              Pedidos
            </NavLink>
            <NavLink
              to="/reembolsos"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              onClick={() => setMenuOpen(false)}
            >
              Reembolsos
            </NavLink>
            <NavLink
              to="/novo-evento"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              onClick={() => setMenuOpen(false)}
            >
              Novo lote
            </NavLink>
            <button
              className="button button--ghost"
              type="button"
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              <LogOut size={17} />
              {logout.isPending ? 'Saindo...' : 'Sair'}
            </button>
          </nav>
        </div>
      </header>

      <main className="page-container">
        <Outlet context={{ setHeaderContext }} />
      </main>
    </div>
  )
}
