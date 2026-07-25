import { AlertTriangle, Inbox, LoaderCircle, RefreshCw } from 'lucide-react'

export function FullPageLoader({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="full-page-state" role="status">
      <LoaderCircle className="spin" size={34} />
      <p>{label}</p>
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="content-state content-state--error" role="alert">
      <span className="content-state__icon">
        <AlertTriangle size={24} />
      </span>
      <div>
        <h3>Não foi possível carregar os dados</h3>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button className="button button--secondary" type="button" onClick={onRetry}>
          <RefreshCw size={17} />
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="content-state">
      <span className="content-state__icon">
        <Inbox size={24} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div aria-label="Carregando painel" aria-busy="true">
      <div className="metrics-grid">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="metric-card skeleton-card" key={index}>
            <span className="skeleton skeleton--short" />
            <span className="skeleton skeleton--value" />
            <span className="skeleton skeleton--medium" />
          </div>
        ))}
      </div>
      <div className="panel skeleton-panel">
        <span className="skeleton skeleton--medium" />
        {Array.from({ length: 5 }).map((_, index) => (
          <span className="skeleton skeleton--row" key={index} />
        ))}
      </div>
    </div>
  )
}
