import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/http'
import { Brand } from '../components/Brand'
import { useAdminLogin, useAdminSession } from '../hooks/useAuth'

export function LoginPage() {
  const session = useAdminSession()
  const login = useAdminLogin()
  const navigate = useNavigate()
  const location = useLocation()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (session.data?.authenticated) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Informe a senha administrativa completa.')
      return
    }

    try {
      await login.mutateAsync(password)
      const state = location.state as { from?: string } | null
      navigate(state?.from ?? '/', { replace: true })
    } catch (caughtError) {
      const message =
        caughtError instanceof ApiError && caughtError.status === 401
          ? 'Senha administrativa inválida.'
          : caughtError instanceof Error
            ? caughtError.message
            : 'Não foi possível entrar. Tente novamente.'
      setError(message)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-card__brand">
          <Brand />
          <span className="security-badge">
            <ShieldCheck size={16} />
            Sessão protegida
          </span>
        </div>

        <div className="login-card__copy">
          <p className="eyebrow">Acesso administrativo</p>
          <h1>Acompanhe vendas, lotes e arrecadação.</h1>
          <p>
            A senha é validada exclusivamente pela API. Nenhuma credencial administrativa é
            armazenada no navegador.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="password">Senha administrativa</label>
          <div className="input-with-icon">
            <LockKeyhole size={19} />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              autoFocus
            />
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="button button--primary button--wide" disabled={login.isPending}>
            {login.isPending ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </form>
      </section>
    </main>
  )
}
