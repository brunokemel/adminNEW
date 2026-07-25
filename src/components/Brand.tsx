import { Activity } from 'lucide-react'

interface BrandProps {
  compact?: boolean
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <div className="brand" aria-label="1KMzinho Admin">
      <span className="brand__mark" aria-hidden="true">
        <Activity size={compact ? 20 : 24} strokeWidth={2.4} />
      </span>
      <span className="brand__text">
        <strong>1KMzinho</strong>
        {!compact && <small>Admin</small>}
      </span>
    </div>
  )
}
