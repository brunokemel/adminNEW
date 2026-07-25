import { useQuery } from '@tanstack/react-query'
import {
  Banknote,
  CalendarDays,
  Clock3,
  Download,
  FilePlus2,
  RefreshCw,
  RotateCcw,
  TicketCheck,
  WalletCards,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { adminApi } from '../api/admin'
import type { HeaderContext } from '../components/AppShell'
import { DashboardSkeleton, EmptyState, ErrorState } from '../components/States'
import { LotesTable } from '../components/LotesTable'
import { KitsSummary } from '../components/KitsSummary'
import { MetricCard } from '../components/MetricCard'
import { SharedCapacityCard } from '../components/SharedCapacityCard'
import type { DashboardFilters, PeriodPreset } from '../types/dashboard'
import { getDateRange } from '../utils/dates'
import { formatCurrency, formatInteger, pluralize } from '../utils/formatters'
import { agruparLotesPorCapacidade } from '../utils/loteGrouping'

interface OutletContext {
  setHeaderContext: (context: HeaderContext) => void
}

export function DashboardPage() {
  const { setHeaderContext } = useOutletContext<OutletContext>()
  const initialRange = getDateRange('today')
  const [period, setPeriod] = useState<PeriodPreset>('today')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [draftFilters, setDraftFilters] = useState<DashboardFilters>({
    nomeEvento: '',
    ...initialRange,
  })
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>({
    nomeEvento: '',
    ...initialRange,
  })
  const [downloadError, setDownloadError] = useState('')

  const eventsQuery = useQuery({
    queryKey: ['dashboard-events'],
    queryFn: adminApi.getEvents,
    staleTime: 60_000,
  })

  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary', appliedFilters],
    queryFn: () => adminApi.getSummary(appliedFilters),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })

  useEffect(() => {
    setHeaderContext({
      updatedAt: summaryQuery.data?.atualizadoEm,
      isFetching: summaryQuery.isFetching,
    })
  }, [setHeaderContext, summaryQuery.data?.atualizadoEm, summaryQuery.isFetching])

  useEffect(() => {
    return () => setHeaderContext({})
  }, [setHeaderContext])

  const totalRemaining =
    summaryQuery.data?.resumo.vagasRestantes ??
    agruparLotesPorCapacidade(summaryQuery.data?.lotes ?? []).reduce(
      (total, grupo) => total + grupo.vagasRestantes,
      0,
    ) ??
    0

  function handlePeriodChange(nextPeriod: PeriodPreset) {
    setPeriod(nextPeriod)
    if (nextPeriod !== 'custom') {
      const range = getDateRange(nextPeriod)
      setDraftFilters((current) => ({ ...current, ...range }))
    }
  }

  function applyFilters() {
    setAppliedFilters({ ...draftFilters, nomeEvento: selectedEvent })
  }

  async function handleDownloadEvent() {
    if (!selectedEvent) return
    setDownloadError('')
    try {
      await adminApi.downloadEventReport(selectedEvent)
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Falha ao baixar relatório.')
    }
  }

  async function handleDownloadLot(eventName: string, lot: string) {
    setDownloadError('')
    try {
      await adminApi.downloadLotReport(eventName, lot)
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Falha ao baixar relatório.')
    }
  }

  const data = summaryQuery.data

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Visão geral</p>
          <h1>Painel de vendas</h1>
          <p>Acompanhe as inscrições e a ocupação dos lotes em tempo quase real.</p>
        </div>
        <span className={`live-indicator ${summaryQuery.isFetching ? 'is-syncing' : ''}`}>
          <span />
          {summaryQuery.isFetching ? 'Atualizando dados' : 'Atualizado agora'}
        </span>
      </section>

      <section className="filter-panel" aria-label="Filtros do painel">
        <div className="field field--event">
          <label htmlFor="event">Evento</label>
          <select
            id="event"
            value={selectedEvent}
            onChange={(event) => setSelectedEvent(event.target.value)}
            disabled={eventsQuery.isLoading}
          >
            <option value="">Todos os eventos</option>
            {(eventsQuery.data ?? []).map((event) => (
              <option value={event.nomeEvento} key={event.nomeEvento}>
                {event.nomeEvento}
              </option>
            ))}
          </select>
        </div>

        <div className="field field--period">
          <span className="field__label">Período</span>
          <div className="segmented-control">
            {([
              ['today', 'Hoje'],
              ['7days', '7 dias'],
              ['month', 'Mês atual'],
              ['custom', 'Personalizado'],
            ] as const).map(([value, label]) => (
              <button
                type="button"
                className={period === value ? 'is-active' : ''}
                onClick={() => handlePeriodChange(value)}
                key={value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {period === 'custom' && (
          <>
            <div className="field">
              <label htmlFor="start-date">Data inicial</label>
              <input
                id="start-date"
                type="date"
                value={draftFilters.dataInicio}
                max={draftFilters.dataFim}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    dataInicio: event.target.value,
                  }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="end-date">Data final</label>
              <input
                id="end-date"
                type="date"
                value={draftFilters.dataFim}
                min={draftFilters.dataInicio}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    dataFim: event.target.value,
                  }))
                }
              />
            </div>
          </>
        )}

        <button className="button button--primary filter-panel__submit" type="button" onClick={applyFilters}>
          <RefreshCw size={17} />
          Atualizar
        </button>
      </section>

      {eventsQuery.isError && (
        <ErrorState
          message={eventsQuery.error instanceof Error ? eventsQuery.error.message : 'Falha ao listar eventos.'}
          onRetry={() => void eventsQuery.refetch()}
        />
      )}

      {!eventsQuery.isLoading && !eventsQuery.isError && eventsQuery.data?.length === 0 && (
        <div className="panel">
          <EmptyState
            title="Nenhum evento cadastrado"
            description="Cadastre o primeiro evento/lote para começar a acompanhar vendas e ocupação."
          />
        </div>
      )}

      {summaryQuery.isLoading ? (
        <DashboardSkeleton />
      ) : summaryQuery.isError ? (
        <ErrorState
          message={summaryQuery.error instanceof Error ? summaryQuery.error.message : 'Falha ao carregar o resumo.'}
          onRetry={() => void summaryQuery.refetch()}
        />
      ) : data ? (
        <>
          <section className="metrics-grid" aria-label="Métricas principais">
            <MetricCard
              label="Inscrições aprovadas"
              value={formatInteger(data.resumo.inscricoesAprovadas)}
              helper={`Ticket médio de ${formatCurrency(data.resumo.ticketMedio)}`}
              icon={TicketCheck}
              tone="success"
            />
            <MetricCard
              label="Arrecadação total"
              value={formatCurrency(data.resumo.valorArrecadado)}
              helper={`${formatCurrency(data.resumo.valorInscricoes)} em inscrições`}
              icon={Banknote}
              tone="success"
            />
            <MetricCard
              label="Taxas arrecadadas"
              value={formatCurrency(data.resumo.valorTaxas)}
              helper="Somente pagamentos aprovados"
              icon={WalletCards}
            />
            <MetricCard
              label="Pedidos pendentes"
              value={formatInteger(data.resumo.pedidosPendentes)}
              helper={`${formatInteger(data.resumo.pedidosRejeitados)} rejeitados · ${formatInteger(
                data.resumo.pedidosCancelados,
              )} cancelados`}
              icon={Clock3}
              tone="warning"
            />
            <MetricCard
              label="Vagas restantes"
              value={formatInteger(totalRemaining)}
              helper="Capacidades compartilhadas deduplicadas pela API"
              icon={CalendarDays}
            />
          </section>

          <section className="panel">
            <div className="panel__header">
              <div>
                <h2>Vendas por kit/lote</h2>
                <p>{pluralize(data.lotes.length, 'lote encontrado', 'lotes encontrados')}</p>
              </div>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => void summaryQuery.refetch()}
                disabled={summaryQuery.isFetching}
              >
                <RefreshCw size={17} className={summaryQuery.isFetching ? 'spin' : ''} />
                Atualizar agora
              </button>
            </div>

            {downloadError && <p className="inline-alert" role="alert">{downloadError}</p>}

            {data.lotes.length === 0 ? (
              <EmptyState
                title="Nenhuma venda encontrada"
                description="Altere o evento ou o período para consultar outros dados."
              />
            ) : (
              <>
                {/* Exibir grupos compartilhados separadamente */}
                {agruparLotesPorCapacidade(data.lotes)
                  .filter((grupo) => grupo.isCompartilhado)
                  .map((grupo) => (
                    <SharedCapacityCard key={grupo.grupoId} grupo={grupo} />
                  ))}

                {/* Tabela com todos os lotes */}
                <LotesTable
                  lotes={data.lotes}
                  grupos={agruparLotesPorCapacidade(data.lotes)}
                  onDownload={handleDownloadLot}
                  isDownloading={summaryQuery.isFetching}
                />
              </>
            )}
          </section>

          <section className="quick-actions">
            <div className="section-title">
              <h2>Ações rápidas</h2>
              <p>Acesse tarefas administrativas frequentes.</p>
            </div>
            <div className="quick-actions__grid">
              <button
                className="action-card"
                type="button"
                onClick={() => void handleDownloadEvent()}
                disabled={!selectedEvent}
              >
                <span><Download size={21} /></span>
                <div>
                  <strong>Relatório completo</strong>
                  <small>{selectedEvent ? `Baixar PDF de ${selectedEvent}` : 'Selecione um evento no filtro'}</small>
                </div>
              </button>

              <Link className="action-card" to="/reembolsos">
                <span><RotateCcw size={21} /></span>
                <div>
                  <strong>Reembolsos pendentes</strong>
                  <small>Ver solicitações aguardando análise</small>
                </div>
              </Link>

              <Link className="action-card" to="/novo-evento">
                <span><FilePlus2 size={21} /></span>
                <div>
                  <strong>Cadastrar evento/lote</strong>
                  <small>Adicionar uma nova opção de inscrição</small>
                </div>
              </Link>
            </div>
          </section>
          <KitsSummary filters={appliedFilters} />
        </>
      ) : null}
    </>
  )
}
