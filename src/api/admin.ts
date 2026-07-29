import type {
  AdminEvent,
  DashboardFilters,
  DashboardResponse,
  EventoEquipasResponse,
  InscricoesResponse,
  RefundRequest,
  ReportParticipant,
  SessionResponse,
} from '../types/dashboard'
import type {
  CadastroEventoLotes,
  RespostaCadastroLotes,
  StatusLote,
} from '../types/events'
import { apiFetch, downloadProtectedFile, getProtectedFile } from './http'

const unwrap = <T>(payload: unknown, keys: string[]): T => {
  if (payload && typeof payload === 'object') {
    for (const key of keys) {
      if (key in payload) return (payload as Record<string, unknown>)[key] as T
    }
  }
  return payload as T
}

const reportPath = (eventName: string) =>
  `/relatorio/${encodeURIComponent(eventName)}/pdf`

export const adminApi = {
  getSession: () => apiFetch<SessionResponse>('/admin/auth/session'),

  login: (password: string) =>
    apiFetch<SessionResponse>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  logout: () =>
    apiFetch<{ success: boolean }>('/admin/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  getEvents: async () =>
    unwrap<AdminEvent[]>(await apiFetch<unknown>('/admin/dashboard/eventos'), ['eventos', 'data']),

  getSummary: async (filters: DashboardFilters) =>
    unwrap<DashboardResponse>(
      await apiFetch<unknown>('/admin/dashboard/resumo', {}, { ...filters }),
      ['dashboard', 'data'],
    ),

  getPendingRefunds: () =>
    apiFetch<RefundRequest[]>('/reembolsos/solicitacoes', {}, { status: 'PENDENTE' }),

  createEventLot: (payload: CadastroEventoLotes) =>
    apiFetch<RespostaCadastroLotes>('/admin/eventos/lotes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getLotStatus: (nomeEvento?: string) =>
    apiFetch<{ lotes: StatusLote[] }>(
      '/lotes/status',
      {},
      nomeEvento ? { nomeEvento } : undefined,
    ),

  downloadEventReport: (eventName: string) =>
    downloadProtectedFile(
      reportPath(eventName),
      `relatorio-${eventName.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.pdf`,
    ),

  getEventReport: (eventName: string) => getProtectedFile(reportPath(eventName)),

  downloadEventExcel: (eventName: string) =>
    downloadProtectedFile(
      `/admin/relatorios/${encodeURIComponent(eventName)}/excel`,
      `participantes-${eventName.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.xls`,
    ),

  searchReportParticipants: (eventName: string, busca: string) =>
    apiFetch<{ participantes: ReportParticipant[] }>(
      `/admin/relatorios/${encodeURIComponent(eventName)}/participantes`,
      {},
      { busca },
    ),

  downloadParticipantReport: (eventName: string, participantId: string, participantName: string) =>
    downloadProtectedFile(
      `/admin/relatorios/${encodeURIComponent(eventName)}/participantes/${encodeURIComponent(participantId)}/pdf`,
      `kit-${participantName.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.pdf`,
    ),

  downloadLotReport: (eventName: string, lot: string) =>
    downloadProtectedFile(
      `/relatorio/${encodeURIComponent(eventName)}/lote/${encodeURIComponent(lot)}/pdf`,
      `relatorio-${eventName.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}-${lot
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '-')}.pdf`,
    ),

  getInscricoes: async (filters: DashboardFilters) => {
    const payload = await apiFetch<unknown>('/admin/inscricoes', {}, { ...filters })
    if (Array.isArray(payload)) {
      return {
        pagina: 1,
        limite: payload.length,
        total: payload.length,
        totalPaginas: 1,
        inscricoes: payload,
      } as InscricoesResponse
    }
    const response = unwrap<Record<string, unknown>>(payload, ['data'])
    const rows = (response?.inscricoes ?? response?.pedidos ?? []) as Array<Record<string, unknown>>
    const inscricoes = rows.map((item) => ({
      ...item,
      nome: item.nome ?? item.nomePessoa ?? '',
      totalPago: item.totalPago ?? item.total ?? null,
      statusComprovante: item.statusComprovante
        ?? (item.comprovanteEnviadoEm ? 'Enviado' : 'Não enviado'),
    }))
    return {
      pagina: Number(response?.pagina ?? filters.pagina ?? 1),
      limite: Number(response?.limite ?? filters.limite ?? 20),
      total: Number(response?.total ?? inscricoes.length),
      totalPaginas: Number(response?.totalPaginas ?? 1),
      inscricoes,
    } as InscricoesResponse
  },

  getEventoEquipas: (nomeEvento: string) =>
    apiFetch<EventoEquipasResponse>(`/admin/eventos/${encodeURIComponent(nomeEvento)}/equipas`),
}
