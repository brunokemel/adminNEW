import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Mail, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminApi } from '../api/admin'
import { EmptyState, ErrorState } from '../components/States'
import { formatShortDate } from '../utils/formatters'

export function RefundsPage() {
  const refundsQuery = useQuery({
    queryKey: ['pending-refunds'],
    queryFn: adminApi.getPendingRefunds,
  })

  return (
    <>
      <section className="page-heading page-heading--with-back">
        <Link className="back-link" to="/">
          <ArrowLeft size={18} />
          Voltar ao painel
        </Link>
        <div>
          <p className="eyebrow">Atendimento</p>
          <h1>Reembolsos pendentes</h1>
          <p>Solicitações com status PENDENTE retornadas pela API.</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <h2>Solicitações aguardando análise</h2>
            <p>Os dados sensíveis permanecem exclusivamente no backend.</p>
          </div>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => void refundsQuery.refetch()}
          >
            <RotateCcw size={17} />
            Atualizar
          </button>
        </div>

        {refundsQuery.isLoading ? (
          <div className="list-skeleton">
            {Array.from({ length: 4 }).map((_, index) => (
              <span className="skeleton skeleton--row" key={index} />
            ))}
          </div>
        ) : refundsQuery.isError ? (
          <ErrorState
            message={refundsQuery.error instanceof Error ? refundsQuery.error.message : 'Falha ao carregar.'}
            onRetry={() => void refundsQuery.refetch()}
          />
        ) : (refundsQuery.data ?? []).length === 0 ? (
          <EmptyState
            title="Nenhum reembolso pendente"
            description="Não há solicitações aguardando análise neste momento."
          />
        ) : (
          <div className="refund-list">
            {(refundsQuery.data ?? []).map((refund) => (
              <article className="refund-card" key={String(refund.id)}>
                <span className="refund-card__icon"><RotateCcw size={20} /></span>
                <div className="refund-card__content">
                  <div className="refund-card__title">
                    <strong>{refund.nome ?? 'Participante não informado'}</strong>
                    <span className="badge badge--warning">{refund.status ?? 'PENDENTE'}</span>
                  </div>
                  <p>{refund.nomeEvento ?? 'Evento não informado'}{refund.lote ? ` · ${refund.lote}` : ''}</p>
                  {refund.motivo && <blockquote>{refund.motivo}</blockquote>}
                  <div className="refund-card__meta">
                    {refund.email && <span><Mail size={15} /> {refund.email}</span>}
                    <span>Solicitado em {formatShortDate(refund.criadoEm ?? refund.createdAt)}</span>
                    <span>Protocolo #{refund.id}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
