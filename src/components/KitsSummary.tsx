import { FileDown, Shirt, UsersRound } from 'lucide-react'
import { useInscricoes } from '../hooks/useInscricoes'
import type { DashboardFilters } from '../types/dashboard'
import { formatTeam, hasApiField, SHIRT_SIZES } from '../utils/participant'

interface KitsSummaryProps {
  filters: DashboardFilters
}

export function KitsSummary({ filters }: KitsSummaryProps) {
  const { data: registrations = [], isLoading, isError } = useInscricoes(filters, Boolean(filters.nomeEvento))
  if (!filters.nomeEvento) return (
    <section className="kits-summary panel">
      <div className="panel__header"><div><h2>Separação de kits</h2><p>Selecione um evento e clique em Atualizar para consultar camisas e equipes.</p></div></div>
    </section>
  )

  const hasShirtData = registrations.some((item) => hasApiField(item, 'numeroCamisa'))
  const hasTeamData = registrations.some((item) => hasApiField(item, 'equipe'))
  const shirtCounts = Object.fromEntries(SHIRT_SIZES.map((size) => [
    size,
    registrations.filter((item) => typeof item.numeroCamisa === 'string' && item.numeroCamisa.trim().toUpperCase() === size).length,
  ]))
  const teamCounts = registrations.reduce<Record<string, number>>((result, item) => {
    const team = formatTeam(item)
    if (team !== 'Sem dados') result[team] = (result[team] ?? 0) + 1
    return result
  }, {})
  const sortedTeams = Object.entries(teamCounts).sort((a, b) => b[1] - a[1])

  return (
    <section className="kits-summary panel">
      <div className="panel__header">
        <div><h2>Separação de kits</h2><p>Resumo dos participantes de {filters.nomeEvento} para organização da entrega.</p></div>
      </div>
      {isLoading ? <p className="kits-summary__state">Carregando dados dos kits...</p> : isError ? <p className="kits-summary__state">Não foi possível carregar os dados dos kits.</p> : (
        <div className="kits-summary__grid">
          <article className="summary-block">
            <div className="summary-block__title"><Shirt size={20} /><h3>Camisas por tamanho</h3></div>
            {!hasShirtData ? <p>Sem dados. Aguardando o campo <code>numeroCamisa</code> da API.</p> : (
              <ul>{SHIRT_SIZES.map((size) => <li key={size}><strong>{size}</strong><span>{shirtCounts[size]}</span></li>)}</ul>
            )}
          </article>
          <article className="summary-block">
            <div className="summary-block__title"><UsersRound size={20} /><h3>Participantes por equipe</h3></div>
            {!hasTeamData ? <p>Sem dados. Aguardando o campo <code>equipe</code> da API.</p> : sortedTeams.length === 0 ? <p>Nenhuma equipe informada.</p> : (
              <ul>{sortedTeams.map(([team, count]) => <li key={team}><strong>{team}</strong><span>{count} participante{count === 1 ? '' : 's'}</span></li>)}</ul>
            )}
          </article>
          <aside className="pdf-explainer">
            <FileDown size={22} />
            <div><strong>PDF pronto para separação</strong><p>O relatório completo do evento ou de cada lote organiza os participantes agrupados por equipe e apresenta os tamanhos de camisa informados.</p></div>
          </aside>
        </div>
      )}
    </section>
  )
}
