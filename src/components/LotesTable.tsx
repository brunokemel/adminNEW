import { Download, Info } from 'lucide-react'
import type { DashboardLotMetrics } from '../types/dashboard'
import { formatCurrency, formatInteger } from '../utils/formatters'
import { OccupancyBar } from './OccupancyBar'
import type { GrupoLotes } from '../utils/loteGrouping'

interface LotesTableProps {
  lotes: DashboardLotMetrics[]
  grupos?: GrupoLotes[]
  onDownload: (eventName: string, lot: string) => void
  isDownloading?: boolean
}

export function LotesTable({ lotes, grupos = [], onDownload, isDownloading = false }: LotesTableProps) {
  // Criar mapa para busca rápida de grupos compartilhados
  const gruposCompartilhadosMap = new Map<string, GrupoLotes>()
  grupos.forEach((grupo) => {
    if (grupo.isCompartilhado && grupo.grupoId) {
      gruposCompartilhadosMap.set(grupo.grupoId, grupo)
    }
  })

  // Função para obter vagas restantes corretas
  const getVagasRestantes = (lote: DashboardLotMetrics): number => {
    if (lote.grupoCapacidade?.id) {
      const grupo = gruposCompartilhadosMap.get(lote.grupoCapacidade.id)
      if (grupo) {
        return grupo.vagasRestantes
      }
    }
    return lote.vagasRestantes
  }

  // Função para obter percentual de ocupação correto
  const getPercentualOcupacao = (lote: DashboardLotMetrics): number => {
    if (lote.grupoCapacidade?.id) {
      const grupo = gruposCompartilhadosMap.get(lote.grupoCapacidade.id)
      if (grupo) {
        return grupo.percentualVendido
      }
    }
    return lote.percentualVendido
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Evento</th>
            <th>Distância</th>
            <th>Kit/lote</th>
            <th>Vendidos</th>
            <th>Pendentes</th>
            <th>Capacidade</th>
            <th>Restantes</th>
            <th>Ocupação</th>
            <th>Vendido em inscrições</th>
            <th>Arrecadação</th>
            <th>
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {lotes.map((item) => (
            <tr
              key={`${item.nomeEvento}-${item.distancia}-${item.lote}`}
              className={item.grupoCapacidade?.id ? 'is-shared-capacity' : ''}
            >
              <td data-label="Evento">
                <strong>{item.nomeEvento}</strong>
              </td>
              <td data-label="Distância">{item.distancia || '—'}</td>
              <td data-label="Kit/lote">
                <div className="lot-cell">
                  <span className="lot-name">{item.lote}</span>
                  {item.grupoCapacidade?.id && (
                    <span
                      className="lot-badge"
                      title="Este kit divide as vagas com outros kits do mesmo evento"
                    >
                      <Info size={14} />
                      Compartilhado
                    </span>
                  )}
                  {item.precos.length > 0 && (
                    <small>{item.precos.map(formatCurrency).join(' · ')}</small>
                  )}
                </div>
              </td>
              <td data-label="Vendidos">{formatInteger(item.vendidos)}</td>
              <td data-label="Pendentes">{formatInteger(item.pendentes)}</td>
              <td data-label="Capacidade">
                <div className="capacity-cell">
                  <span>{formatInteger(item.capacidade)}</span>
                  {item.grupoCapacidade?.id && (
                    <small className="text-secondary">
                      (grupo: {formatInteger(item.grupoCapacidade.capacidadeTotal)})
                    </small>
                  )}
                </div>
              </td>
              <td data-label="Restantes">
                <span className={getVagasRestantes(item) <= 10 ? 'badge badge--warning' : 'badge'}>
                  {formatInteger(getVagasRestantes(item))}
                </span>
              </td>
              <td data-label="Ocupação">
                <OccupancyBar value={getPercentualOcupacao(item)} />
              </td>
              <td data-label="Vendido em inscrições">
                <strong>{formatCurrency(item.valorInscricoes)}</strong>
              </td>
              <td data-label="Arrecadação">
                <strong>{formatCurrency(item.valorArrecadado)}</strong>
                <small className="value-breakdown">inclui {formatCurrency(item.valorTaxas)} em taxas</small>
              </td>
              <td data-label="Relatório">
                <button
                  className="icon-button"
                  type="button"
                  title="Baixar relatório PDF do lote"
                  aria-label={`Baixar relatório do lote ${item.lote}`}
                  onClick={() => onDownload(item.nomeEvento, item.lote)}
                  disabled={isDownloading}
                >
                  <Download size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
