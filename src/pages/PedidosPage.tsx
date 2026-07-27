import { Eye, Filter, RefreshCw, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { HeaderContext } from '../components/AppShell'
import { DashboardSkeleton, EmptyState, ErrorState } from '../components/States'
import { usePedidosPage } from '../hooks/useInscricoes'
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
  const [status, setStatus] = useState<DashboardFilters['status']>('')
  const [limit, setLimit] = useState(20)
  const [selected, setSelected] = useState<Inscricao | null>(null)
  const [filters, setFilters] = useState<DashboardFilters>({
    nomeEvento: '',
    ...initialRange,
    pagina: 1,
    limite: 20,
  })
  const { data, isLoading, isFetching, error, refetch } = usePedidosPage(filters)
  const inscricoes = data?.inscricoes ?? []

  useEffect(() => {
    setHeaderContext({ updatedAt: new Date().toISOString(), isFetching })
    return () => setHeaderContext({})
  }, [setHeaderContext, isFetching])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFilters((current) => ({
        ...current,
        busca: searchTerm.trim(),
        pagina: 1,
      }))
    }, 400)
    return () => window.clearTimeout(timeout)
  }, [searchTerm])

  function applyFilters() {
    setFilters((current) => ({
      ...current,
      equipe: filterTeam.trim(),
      numeroCamisa: shirtSize,
      numeroInscricao: registrationSearch.trim(),
      status,
      limite: limit,
      pagina: 1,
    }))
  }

  return (
    <>
      <section className="page-heading"><div><p className="eyebrow">Inscrições</p><h1>Gerenciar pedidos</h1><p>Acompanhe inscrições, participantes, equipes e dados dos kits.</p></div></section>

      <section className="filter-panel orders-filters" aria-label="Filtros de pedidos">
        <div className="field"><label htmlFor="search">Nome ou e-mail</label><div className="input-with-search"><Search size={18} /><input id="search" placeholder="Buscar participante..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div>
        <div className="field"><label htmlFor="team-filter">Equipe</label><input id="team-filter" placeholder="Nome da equipe..." value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} /></div>
        <div className="field"><label htmlFor="shirt-filter">Tamanho da camisa</label><select id="shirt-filter" value={shirtSize} onChange={(e) => setShirtSize(e.target.value)}><option value="">Todos</option>{SHIRT_SIZES.map((size) => <option key={size}>{size}</option>)}</select></div>
        <div className="field"><label htmlFor="registration-filter">Nº inscrição</label><input id="registration-filter" inputMode="numeric" placeholder="Ex.: 0025" value={registrationSearch} onChange={(e) => setRegistrationSearch(e.target.value)} /></div>
        <div className="field"><label htmlFor="status-filter">Status</label><select id="status-filter" value={status} onChange={(e) => setStatus(e.target.value as DashboardFilters['status'])}><option value="">Todos</option><option value="PENDENTE">Pendente</option><option value="APROVADO">Aprovado</option><option value="REJEITADO">Rejeitado</option><option value="CANCELADO">Cancelado</option></select></div>
        <div className="field field--limit"><label htmlFor="limit-filter">Por página</label><select id="limit-filter" value={limit} onChange={(e) => setLimit(Number(e.target.value))}><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select></div>
        <button className="button button--primary" type="button" onClick={applyFilters} disabled={isLoading}><Filter size={17} />Filtrar</button>
        <button className="button button--secondary" type="button" aria-label="Atualizar pedidos" onClick={() => void refetch()} disabled={isFetching}><RefreshCw size={17} className={isFetching ? 'spin' : ''} /></button>
      </section>

      {error && <ErrorState message={error instanceof Error ? error.message : 'Falha ao carregar pedidos.'} onRetry={() => void refetch()} />}
      {isLoading ? <DashboardSkeleton /> : inscricoes.length === 0 ? (
        <div className="panel"><EmptyState title="Nenhum pedido encontrado" description="Tente alterar os filtros ou a pesquisa." /></div>
      ) : (
        <section className="panel">
          <div className="panel__header"><div><h2>Pedidos ({formatInteger(data?.total ?? 0)})</h2><p>Página {data?.pagina ?? 1} de {data?.totalPaginas ?? 1}</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Evento</th><th>Kit/lote</th><th>Equipe</th><th>Tamanho da camisa</th><th>Nº inscrição</th><th>Status</th><th>Data</th><th aria-label="Ações" /></tr></thead>
            <tbody>{inscricoes.map((inscricao) => <tr key={inscricao.id}>
              <td data-label="Nome"><strong>{inscricao.nome || '—'}</strong></td><td data-label="E-mail">{inscricao.email || '—'}</td><td data-label="Evento">{inscricao.nomeEvento || '—'}</td><td data-label="Kit/lote">{inscricao.lote || '—'}</td>
              <td data-label="Equipe"><span className={`team-badge ${!inscricao.equipe ? 'team-badge--empty' : ''}`}>{inscricao.equipe || '—'}</span></td>
              <td data-label="Tamanho da camisa">{inscricao.numeroCamisa || '—'}</td><td data-label="Nº inscrição"><span className="registration-number">{inscricao.numeroInscricao ? formatRegistrationNumber(inscricao) : '—'}</span></td>
              <td data-label="Status"><span className={`status-badge status-badge--${inscricao.status}`}>{inscricao.status || '—'}</span></td><td data-label="Data">{inscricao.criadoEm ? new Date(inscricao.criadoEm).toLocaleDateString('pt-BR') : '—'}</td>
              <td data-label="Detalhes"><button className="icon-button" type="button" aria-label={`Ver pedido de ${inscricao.nome || 'participante'}`} onClick={() => setSelected(inscricao)}><Eye size={18} /></button></td>
            </tr>)}</tbody>
          </table></div>
          <div className="pagination">
            <button className="button button--secondary" type="button" disabled={isFetching || (data?.pagina ?? 1) <= 1} onClick={() => setFilters((current) => ({ ...current, pagina: Math.max(1, (current.pagina ?? 1) - 1) }))}>Página anterior</button>
            <span>{formatInteger(data?.total ?? 0)} registro{data?.total === 1 ? '' : 's'}</span>
            <button className="button button--secondary" type="button" disabled={isFetching || (data?.pagina ?? 1) >= (data?.totalPaginas ?? 1)} onClick={() => setFilters((current) => ({ ...current, pagina: (current.pagina ?? 1) + 1 }))}>Próxima página</button>
          </div>
        </section>
      )}
      {selected && <ParticipantDetail inscricao={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
