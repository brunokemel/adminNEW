import type {
  AdminEvent,
  DashboardFilters,
  DashboardResponse,
  EventoEquipasResponse,
  InscricoesResponse,
  NewEventLotPayload,
  RefundRequest,
  SessionResponse,
} from '../types/dashboard'
import { apiFetch, downloadProtectedFile } from './http'

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

  getEvents: () => apiFetch<AdminEvent[]>('/admin/dashboard/eventos'),

  getSummary: (filters: DashboardFilters) =>
    apiFetch<DashboardResponse>('/admin/dashboard/resumo', {}, { ...filters }),

  getPendingRefunds: () =>
    apiFetch<RefundRequest[]>('/reembolsos/solicitacoes', {}, { status: 'PENDENTE' }),

  createEventLot: (payload: NewEventLotPayload) =>
    apiFetch<{ success?: boolean; message?: string }>('/admin/eventos/lotes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  downloadEventReport: (eventName: string) =>
    downloadProtectedFile(
      `/relatorio/${encodeURIComponent(eventName)}/pdf`,
      `relatorio-${eventName.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.pdf`,
    ),

  downloadLotReport: (eventName: string, lot: string) =>
    downloadProtectedFile(
      `/relatorio/${encodeURIComponent(eventName)}/lote/${encodeURIComponent(lot)}/pdf`,
      `relatorio-${eventName.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}-${lot
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '-')}.pdf`,
    ),

  getInscricoes: (filters: DashboardFilters) =>
    apiFetch<InscricoesResponse>('/admin/inscricoes', {}, { ...filters }),

  getEventoEquipas: (nomeEvento: string) =>
    apiFetch<EventoEquipasResponse>(`/admin/eventos/${encodeURIComponent(nomeEvento)}/equipas`),
}
