import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  helper: string
  icon: LucideIcon
  tone?: 'default' | 'success' | 'warning'
}

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'default',
}: MetricCardProps) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__head">
        <span>{label}</span>
        <span className="metric-card__icon">
          <Icon size={20} />
        </span>
      </div>
      <strong className="metric-card__value">{value}</strong>
      <small>{helper}</small>
    </article>
  )
}
