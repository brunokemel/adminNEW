import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="full-page-state">
      <p className="eyebrow">Erro 404</p>
      <h1>Página não encontrada</h1>
      <p>O endereço acessado não existe no painel administrativo.</p>
      <Link className="button button--primary" to="/">Voltar ao painel</Link>
    </main>
  )
}
