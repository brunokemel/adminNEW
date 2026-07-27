import { useQuery } from '@tanstack/react-query'
import { Download, FileText, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { adminApi } from '../api/admin'
import { useInscricoes } from '../hooks/useInscricoes'
import type { DashboardFilters } from '../types/dashboard'
import { formatShirtSize } from '../utils/participant'
import { EmptyState, ErrorState } from './States'

interface EventPreviewProps {
  filters: DashboardFilters
  onDownload: () => void
}

export function EventPreview({ filters, onDownload }: EventPreviewProps) {
  const [tab, setTab] = useState<'participants' | 'pdf'>('participants')
  const registrationsQuery = useInscricoes(filters, Boolean(filters.nomeEvento))
  const pdfQuery = useQuery({
    queryKey: ['event-report-preview', filters.nomeEvento],
    queryFn: () => adminApi.getEventReport(filters.nomeEvento),
    enabled: Boolean(filters.nomeEvento) && tab === 'pdf',
    staleTime: 60_000,
  })
  const pdfUrl = useMemo(
    () => pdfQuery.data ? URL.createObjectURL(pdfQuery.data) : '',
    [pdfQuery.data],
  )

  useEffect(() => () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
  }, [pdfUrl])

  if (!filters.nomeEvento) return null
  const registrations = registrationsQuery.data ?? []

  return (
    <section className="panel event-preview">
      <div className="panel__header event-preview__header">
        <div>
          <p className="eyebrow">Evento selecionado</p>
          <h2>Prévia de {filters.nomeEvento}</h2>
          <p>Confira os dados antes de baixar ou imprimir o relatório.</p>
        </div>
        <button className="button button--secondary" type="button" onClick={onDownload}>
          <Download size={17} /> Baixar PDF
        </button>
      </div>

      <div className="preview-tabs" role="tablist" aria-label="Prévia do relatório">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'participants'}
          className={tab === 'participants' ? 'is-active' : ''}
          onClick={() => setTab('participants')}
        >
          <Users size={17} /> Participantes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'pdf'}
          className={tab === 'pdf' ? 'is-active' : ''}
          onClick={() => setTab('pdf')}
        >
          <FileText size={17} /> PDF
        </button>
      </div>

      {tab === 'participants' && (
        registrationsQuery.isLoading ? <p className="preview-state">Carregando participantes...</p>
          : registrationsQuery.isError ? (
            <ErrorState
              message={registrationsQuery.error instanceof Error ? registrationsQuery.error.message : 'Falha ao carregar participantes.'}
              onRetry={() => void registrationsQuery.refetch()}
            />
          ) : registrations.length === 0 ? (
            <EmptyState title="Nenhum participante no período" description="Altere o período do filtro e clique em Atualizar." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Nome</th><th>E-mail</th><th>Kit/lote</th><th>Camisa</th><th>Status</th></tr></thead>
                <tbody>{registrations.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Nome"><strong>{item.nome || 'Não informado'}</strong></td>
                    <td data-label="E-mail">{item.email || 'Não informado'}</td>
                    <td data-label="Kit/lote">{item.lote || 'Não informado'}</td>
                    <td data-label="Camisa">{formatShirtSize(item)}</td>
                    <td data-label="Status">{item.status || 'Não informado'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )
      )}

      {tab === 'pdf' && (
        pdfQuery.isLoading ? <p className="preview-state">Gerando prévia do PDF...</p>
          : pdfQuery.isError ? (
            <ErrorState
              message={pdfQuery.error instanceof Error ? pdfQuery.error.message : 'Falha ao carregar o PDF.'}
              onRetry={() => void pdfQuery.refetch()}
            />
          ) : pdfUrl ? (
            <iframe className="pdf-preview-frame" src={pdfUrl} title={`Relatório de ${filters.nomeEvento}`} />
          ) : null
      )}
    </section>
  )
}
