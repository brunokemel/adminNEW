import { AlertCircle, Package2 } from 'lucide-react'
import type { GrupoLotes } from '../utils/loteGrouping'
import { formatCurrency, formatInteger } from '../utils/formatters'

interface SharedCapacityCardProps {
  grupo: GrupoLotes
}

export function SharedCapacityCard({ grupo }: SharedCapacityCardProps) {
  if (!grupo.isCompartilhado) {
    return null
  }

  return (
    <div className="shared-capacity-card">
      <div className="shared-capacity-card__header">
        <div className="shared-capacity-card__icon">
          <Package2 size={20} />
        </div>
        <div>
          <h3>{grupo.nomeEvento}</h3>
          <p className="shared-capacity-card__distance">{grupo.distancia}</p>
        </div>
      </div>

      <div className="shared-capacity-card__alert">
        <AlertCircle size={18} />
        <p>
          <strong>Capacidade compartilhada:</strong> Os kits abaixo dividem as mesmas vagas. Não some as capacidades individuais.
        </p>
      </div>

      <div className="shared-capacity-card__metrics">
        <div className="metric">
          <span className="metric__label">Capacidade total</span>
          <span className="metric__value">{formatInteger(grupo.capacidadeTotal)} vagas</span>
        </div>
        <div className="metric">
          <span className="metric__label">Inscrições aprovadas</span>
          <span className="metric__value">{formatInteger(grupo.vendidosTotais)}</span>
        </div>
        <div className="metric">
          <span className="metric__label">Pagamentos pendentes</span>
          <span className="metric__value">{formatInteger(grupo.pendentesTotais)}</span>
        </div>
        <div className="metric">
          <span className="metric__label">Vagas disponíveis</span>
          <span className="metric__value">{formatInteger(grupo.vagasRestantes)}</span>
        </div>
        <div className="metric">
          <span className="metric__label">Ocupação</span>
          <span className="metric__value">{grupo.percentualVendido}%</span>
        </div>
        <div className="metric">
          <span className="metric__label">Arrecadação total</span>
          <span className="metric__value">{formatCurrency(grupo.valorArrecadadoTotal)}</span>
        </div>
      </div>

      <div className="shared-capacity-card__kits">
        <h4>Kits que usam essas mesmas vagas</h4>
        <ul className="kits-list">
          {grupo.lotes.map((lote) => (
            <li key={`${lote.nomeEvento}-${lote.lote}`} className="kit-item">
              <span className="kit-item__name">{lote.lote}</span>
              <span className="kit-item__badge">{formatInteger(lote.vendidos)} vendas</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
