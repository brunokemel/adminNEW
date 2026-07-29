export const CATEGORIAS_LOTE = [
  'MASCULINO',
  'FEMININO',
  'MAIOR_60',
  'LGBTQIA',
  'PCD',
] as const

export type CategoriaLote = (typeof CATEGORIAS_LOTE)[number]

export interface PrecoLoteForm {
  categoria: CategoriaLote
  valor: number
  ativo: boolean
}

export interface LoteForm {
  id: string
  lote: string
  capacidade: number
  dataInicio: string | null
  dataFim: string | null
  viradaPorData: boolean
  viradaPorCapacidade: boolean
  ativo: boolean
  grupoCapacidade: string | null
  capacidadeGrupo: number | null
  precos: PrecoLoteForm[]
  existente?: boolean
}

export interface CadastroEventoLotes {
  nomeEvento: string
  distancia: string
  lotes: Omit<LoteForm, 'existente'>[]
}

export interface RespostaCadastroLotes {
  success: boolean
  message: string
  evento?: string
  lotesSalvos?: Array<{
    id: string
    lote: string
    capacidade: number
    precos: number
  }>
}

export interface StatusLote extends Omit<LoteForm, 'precos' | 'existente'> {
  nomeEvento: string
  distancia: string
  disponivel: boolean
  motivoIndisponibilidade: string | null
  vendidos: number
  reservados: number
  vagasRestantes: number
  vagasReservaveis: number
  percentualVendido: number
  capacidadeTotal?: number
  vendidosTotal?: number
  vagasRestantesTotal?: number
  precos: Array<{ categoria: CategoriaLote; valor: number }>
}
