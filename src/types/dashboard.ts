export type PeriodPreset = 'today' | '7days' | 'month' | 'custom'

export interface EventLotOption {
  id?: string
  nomeEvento: string
  distancia: string
  lote: string
  capacidade: number
  ativo?: boolean
  grupoCapacidade?: CapacidadeGrupo | null
  precos?: number[]
}

export interface AdminEvent {
  nomeEvento: string
  lotes: EventLotOption[]
}

export interface DashboardSummaryMetrics {
  inscricoesAprovadas: number
  pedidosPendentes: number
  pedidosRejeitados: number
  pedidosCancelados: number
  valorArrecadado: number
  valorInscricoes: number
  valorTaxas: number
  ticketMedio: number
  vagasRestantes?: number
}

export interface CapacidadeGrupo {
  id: string
  capacidadeTotal: number
}

export interface DashboardLotMetrics {
  nomeEvento: string
  distancia: string
  lote: string
  capacidade: number
  vendidos: number
  pendentes: number
  vagasRestantes: number
  percentualVendido: number
  valorArrecadado: number
  valorInscricoes: number
  valorTaxas: number
  precos: number[]
  grupoCapacidade?: CapacidadeGrupo | null
}

export interface DashboardResponse {
  atualizadoEm: string
  resumo: DashboardSummaryMetrics
  lotes: DashboardLotMetrics[]
}

export interface SessionResponse {
  authenticated: boolean
  expiresAt?: string
}

export interface Inscricao {
  id: string | number
  nome: string
  email: string
  nomeEvento: string
  lote: string
  equipe?: string | null
  numeroCamisa?: 'PP' | 'P' | 'M' | 'G' | 'GG' | string | null
  numeroInscricao?: string | number | null
  contato?: string | null
  telefone?: string | null
  distancia?: string | null
  categoria?: string | null
  statusPagamento?: string | null
  totalPago?: number | string | null
  statusComprovante?: string | null
  comprovanteEnviado?: boolean | null
  status: string
  criadoEm: string
  [key: string]: unknown
}

export interface InscricoesResponse {
  pagina: number
  limite: number
  total: number
  totalPaginas: number
  inscricoes: Inscricao[]
}

export interface ResumoEquipe {
  nome: string
  participantes: number
  lotes: string[]
}

export interface EventoEquipasResponse {
  totalEquipas: number
  totalParticipantesEmEquipas: number
  equipas: ResumoEquipe[]
}

export interface RefundRequest {
  id: string | number
  nome?: string
  email?: string
  nomeEvento?: string
  lote?: string
  motivo?: string
  status?: string
  criadoEm?: string
  createdAt?: string
  [key: string]: unknown
}

export interface NewEventLotPayload {
  nomeEvento: string
  distancia: string
  lote: string
  capacidade: number
  grupoCapacidade?: string
  precos: number[]
  ativo: boolean
}

export interface DashboardFilters {
  nomeEvento: string
  dataInicio: string
  dataFim: string
  equipe?: string
  numeroCamisa?: string
  numeroInscricao?: string
  status?: 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'CANCELADO' | ''
  lote?: string
  busca?: string
  pagina?: number
  limite?: number
}
