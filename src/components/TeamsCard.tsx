import { Users } from 'lucide-react'
import type { EventoEquipasResponse } from '../types/dashboard'

interface TeamsCardProps {
  data: EventoEquipasResponse | undefined
  isLoading?: boolean
}

export function TeamsCard({ data, isLoading = false }: TeamsCardProps) {
  if (isLoading) {
    return (
      <div className="teams-card">
        <div className="teams-card__header">
          <Users size={20} />
          <h3>Equipes inscritas</h3>
        </div>
        <div className="skeleton skeleton--medium" style={{ margin: '12px 0' }} />
      </div>
    )
  }

  if (!data || data.equipas.length === 0) {
    return (
      <div className="teams-card">
        <div className="teams-card__header">
          <Users size={20} />
          <h3>Equipes inscritas</h3>
        </div>
        <p className="teams-card__empty">Sem dados de equipes. Aguardando atualização da API.</p>
      </div>
    )
  }

  return (
    <div className="teams-card">
      <div className="teams-card__header">
        <Users size={20} />
        <h3>Equipes inscritas</h3>
      </div>

      <div className="teams-card__summary">
        <div className="summary-stat">
          <span className="summary-stat__label">Total de equipes</span>
          <span className="summary-stat__value">{data.totalEquipas}</span>
        </div>
        <div className="summary-stat">
          <span className="summary-stat__label">Participantes em equipes</span>
          <span className="summary-stat__value">{data.totalParticipantesEmEquipas}</span>
        </div>
      </div>

      <div className="teams-card__list">
        <h4>Principais equipes</h4>
        <ul className="teams-list">
          {data.equipas.slice(0, 5).map((equipe) => (
            <li key={equipe.nome} className="team-item">
              <div className="team-item__content">
                <span className="team-item__name">{equipe.nome || 'Sem equipe'}</span>
                <small className="team-item__lotes">
                  {equipe.lotes.join(' • ') || 'Sem lotes informados'}
                </small>
              </div>
              <span className="team-item__badge">{equipe.participantes}</span>
            </li>
          ))}
        </ul>

        {data.equipas.length > 5 && (
          <p className="teams-card__more">
            + {data.equipas.length - 5} equipe{data.equipas.length - 5 === 1 ? '' : 's'}
          </p>
        )}
      </div>
    </div>
  )
}
