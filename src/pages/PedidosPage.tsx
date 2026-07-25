import { Eye, Filter, RefreshCw, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { HeaderContext } from '../components/AppShell'
import { DashboardSkeleton, EmptyState, ErrorState } from '../components/States'
import { useInscricoes } from '../hooks/useInscricoes'
import type { DashboardFilters, Inscricao } from '../types/dashboard'
import { getDateRange } from '../utils/dates'
import { formatCurrency, formatInteger } from '../utils/formatters'
import {
  formatRegistrationNumber,
  formatShirtSize,
  formatTeam,
  hasApiField,
  SHIRT_SIZES,
} from '../utils/participant'

interface OutletContext {
  setHeaderContext: (context: HeaderContext) => void
}

const text = (value: unknown, fallback = 'Sem dados') =>
  typeof value === 'string' && value.trim() ? value : fallback

function ParticipantDetail({ inscricao, onClose }: { inscricao: Inscricao; onClose: () => void }) {
  const contact = hasApiField(inscricao, 'contato')
    ? text(inscricao.contato, 'Não informado')
    : hasApiField(inscricao, 'telefone')
      ? text(inscricao.telefone, 'Não informado')
      : 'Sem dados'
  const paymentStatus = hasApiField(inscricao, 'statusPagamento')
    ? text(inscricao.statusPagamento, 'Não informado')
    : text(inscricao.status)
  const total =
    hasApiField(inscricao, 'totalPago') && inscricao.totalPago !== null && inscricao.totalPago !== ''
      ? formatCurrency(Number(inscricao.totalPago))
      : hasApiField(inscricao, 'totalPago') ? 'Não informado' : 'Sem dados'
  const receipt = hasApiField(inscricao, 'statusComprovante')
    ? text(inscricao.statusComprovante, 'Não informado')
    : hasApiField(inscricao, 'comprovanteEnviado')
      ? inscricao.comprovanteEnviado ? 'Enviado' : 'Não enviado'
      : 'Sem dados'

  const fields = [
    ['Nome completo', text(inscricao.nome)],
    ['E-mail', text(inscricao.email)],
    ['Contato', contact],
    ['Equipe', formatTeam(inscricao)],
    ['Evento', text(inscricao.nomeEvento)],
    ['Distância', hasApiField(inscricao, 'distancia') ? text(inscricao.distancia, 'Não informada') : 'Sem dados'],
    ['Kit/lote', text(inscricao.lote)],
    ['Categoria', hasApiField(inscricao, 'categoria') ? text(inscricao.categoria, 'Não informada') : 'Sem dados'],
    ['Tamanho da camisa', formatShirtSize(inscricao)],
    ['Nº inscrição', formatRegistrationNumber(inscricao)],
    ['Status do pagamento', paymentStatus],
    ['Total pago', total],
    ['Data da compra', inscricao.criadoEm ? new Date(inscricao.criadoEm).toLocaleString('pt-BR') : 'Sem dados'],
    ['Status do comprovante enviado', receipt],
  ]

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="participant-modal" role="dialog" aria-modal="true" aria-labelledby="participant-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="participant-modal__header">
          <div>
            <p className="eyebrow">Pedido #{inscricao.id}</p>
            <h2 id="participant-title">Dados do participante</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Fechar detalhes" onClick={onClose}><X size={19} /></button>
        </header>
        <dl className="participant-details">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}

export function PedidosPage() {
  const { setHeaderContext } = useOutletContext<OutletContext>()
  const initialRange = getDateRange('month')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTeam, setFilterTeam] = useState('')
  const [shirtSize, setShirtSize] = useState('')
  const [registrationSearch, setRegistrationSearch] = useState('')
  const [selected, setSelected] = useState<Inscricao | null>(null)
  const [filters, setFilters] = useState<DashboardFilters>({ nomeEvento: '', ...initialRange })
  const { data: inscricoes = [], isLoading, error, refetch } = useInscricoes(filters)

  useEffect(() => {
    setHeaderContext({ updatedAt: new Date().toISOString(), isFetching: isLoading })
    return () => setHeaderContext({})
  }, [setHeaderContext, isLoading])

  const filteredInscricoes = useMemo(() => inscricoes.filter((inscricao) => {
    const query = searchTerm.trim().toLocaleLowerCase('pt-BR')
    const registration = registrationSearch.trim().toLocaleLowerCase('pt-BR')
    return (!query || [inscricao.nome, inscricao.email].some((value) => value?.toLocaleLowerCase('pt-BR').includes(query)))
      && (!filterTeam || formatTeam(inscricao).toLocaleLowerCase('pt-BR').includes(filterTeam.toLocaleLowerCase('pt-BR')))
      && (!shirtSize || formatShirtSize(inscricao) === shirtSize)
      && (!registration || formatRegistrationNumber(inscricao).toLocaleLowerCase('pt-BR').includes(registration))
  }), [filterTeam, inscricoes, registrationSearch, searchTerm, shirtSize])

  function applyFilters() {
    setFilters((current) => ({ ...current, equipe: filterTeam, numeroCamisa: shirtSize, numeroInscricao: registrationSearch }))
  }

  return (
    <>
      <section className="page-heading"><div><p className="eyebrow">Inscrições</p><h1>Gerenciar pedidos</h1><p>Acompanhe inscrições, participantes, equipes e dados dos kits.</p></div></section>

      <section className="filter-panel orders-filters" aria-label="Filtros de pedidos">
        <div className="field"><label htmlFor="search">Nome ou e-mail</label><div className="input-with-search"><Search size={18} /><input id="search" placeholder="Buscar participante..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div>
        <div className="field"><label htmlFor="team-filter">Equipe</label><input id="team-filter" placeholder="Nome da equipe..." value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} /></div>
        <div className="field"><label htmlFor="shirt-filter">Tamanho da camisa</label><select id="shirt-filter" value={shirtSize} onChange={(e) => setShirtSize(e.target.value)}><option value="">Todos</option>{SHIRT_SIZES.map((size) => <option key={size}>{size}</option>)}</select></div>
        <div className="field"><label htmlFor="registration-filter">Nº inscrição</label><input id="registration-filter" inputMode="numeric" placeholder="Ex.: 0025" value={registrationSearch} onChange={(e) => setRegistrationSearch(e.target.value)} /></div>
        <button className="button button--primary" type="button" onClick={applyFilters} disabled={isLoading}><Filter size={17} />Filtrar</button>
        <button className="button button--secondary" type="button" aria-label="Atualizar pedidos" onClick={() => void refetch()} disabled={isLoading}><RefreshCw size={17} className={isLoading ? 'spin' : ''} /></button>
      </section>

      {error && <ErrorState message={error instanceof Error ? error.message : 'Falha ao carregar pedidos.'} onRetry={() => void refetch()} />}
      {isLoading ? <DashboardSkeleton /> : filteredInscricoes.length === 0 ? (
        <div className="panel"><EmptyState title="Nenhum pedido encontrado" description="Tente alterar os filtros ou a pesquisa." /></div>
      ) : (
        <section className="panel">
          <div className="panel__header"><h2>Pedidos ({formatInteger(filteredInscricoes.length)})</h2></div>
          <div className="table-wrap"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Evento</th><th>Kit/lote</th><th>Equipe</th><th>Tamanho da camisa</th><th>Nº inscrição</th><th>Status</th><th>Data</th><th aria-label="Ações" /></tr></thead>
            <tbody>{filteredInscricoes.map((inscricao) => <tr key={inscricao.id}>
              <td data-label="Nome"><strong>{inscricao.nome}</strong></td><td data-label="E-mail">{inscricao.email}</td><td data-label="Evento">{inscricao.nomeEvento}</td><td data-label="Kit/lote">{inscricao.lote}</td>
              <td data-label="Equipe"><span className={`team-badge ${formatTeam(inscricao) === 'Sem equipe' || formatTeam(inscricao) === 'Sem dados' ? 'team-badge--empty' : ''}`}>{formatTeam(inscricao)}</span></td>
              <td data-label="Tamanho da camisa">{formatShirtSize(inscricao)}</td><td data-label="Nº inscrição"><span className="registration-number">{formatRegistrationNumber(inscricao)}</span></td>
              <td data-label="Status"><span className={`status-badge status-badge--${inscricao.status}`}>{inscricao.status}</span></td><td data-label="Data">{new Date(inscricao.criadoEm).toLocaleDateString('pt-BR')}</td>
              <td data-label="Detalhes"><button className="icon-button" type="button" aria-label={`Ver pedido de ${inscricao.nome}`} onClick={() => setSelected(inscricao)}><Eye size={18} /></button></td>
            </tr>)}</tbody>
          </table></div>
        </section>
      )}
      {selected && <ParticipantDetail inscricao={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
