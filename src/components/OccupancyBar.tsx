interface OccupancyBarProps {
  value: number
}

export function OccupancyBar({ value }: OccupancyBarProps) {
  const percentage = Math.min(100, Math.max(0, value))

  return (
    <div className="occupancy" aria-label={`${percentage.toFixed(0)}% vendido`}>
      <div className="occupancy__track">
        <span className="occupancy__fill" style={{ width: `${percentage}%` }} />
      </div>
      <strong>{percentage.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</strong>
    </div>
  )
}
