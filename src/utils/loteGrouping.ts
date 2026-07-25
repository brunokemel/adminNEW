import type { DashboardLotMetrics } from '../types/dashboard'

export interface GrupoLotes {
  grupoId: string | null
  nomeEvento: string
  distancia: string
  capacidadeTotal: number
  lotes: DashboardLotMetrics[]
  vendidosTotais: number
  pendentesTotais: number
  vagasRestantes: number
  percentualVendido: number
  valorArrecadadoTotal: number
  valorInscricoesTotal: number
  valorTaxasTotal: number
  isCompartilhado: boolean
}

/**
 * Agrupa lotes pela capacidade compartilhada
 * Lotes com mesmo grupoCapacidade.id são agrupados
 */
export function agruparLotesPorCapacidade(lotes: DashboardLotMetrics[]): GrupoLotes[] {
  const grupos = new Map<string | null, DashboardLotMetrics[]>()

  // Agrupar lotes
  for (const lote of lotes) {
    const grupoId = lote.grupoCapacidade?.id ?? null
    const chave = grupoId === null ? `individual-${lote.nomeEvento}-${lote.distancia}-${lote.lote}` : grupoId

    if (!grupos.has(chave)) {
      grupos.set(chave, [])
    }
    grupos.get(chave)!.push(lote)
  }

  // Transformar em GrupoLotes
  const resultado: GrupoLotes[] = []

  for (const lotesDoGrupo of grupos.values()) {
    const primeiroLote = lotesDoGrupo[0]!
    const isCompartilhado = lotesDoGrupo.length > 1

    // Para lotes compartilhados, usar capacidade do grupo
    // Para lotes individuais, usar capacidade do próprio lote
    const capacidadeTotal = isCompartilhado
      ? primeiroLote.grupoCapacidade?.capacidadeTotal ?? primeiroLote.capacidade
      : primeiroLote.capacidade

    const vendidosTotais = lotesDoGrupo.reduce((sum, l) => sum + l.vendidos, 0)
    const pendentesTotais = lotesDoGrupo.reduce((sum, l) => sum + l.pendentes, 0)
    const valorArrecadadoTotal = lotesDoGrupo.reduce((sum, l) => sum + l.valorArrecadado, 0)
    const valorInscricoesTotal = lotesDoGrupo.reduce((sum, l) => sum + l.valorInscricoes, 0)
    const valorTaxasTotal = lotesDoGrupo.reduce((sum, l) => sum + l.valorTaxas, 0)

    // Vagas restantes: usar do primeiro lote (já deduplicado pela API)
    const vagasRestantes = primeiroLote.vagasRestantes

    const percentualVendido = capacidadeTotal > 0 ? Math.round((vendidosTotais / capacidadeTotal) * 100) : 0

    resultado.push({
      grupoId: isCompartilhado ? primeiroLote.grupoCapacidade?.id ?? null : null,
      nomeEvento: primeiroLote.nomeEvento,
      distancia: primeiroLote.distancia,
      capacidadeTotal,
      lotes: lotesDoGrupo,
      vendidosTotais,
      pendentesTotais,
      vagasRestantes,
      percentualVendido,
      valorArrecadadoTotal,
      valorInscricoesTotal,
      valorTaxasTotal,
      isCompartilhado,
    })
  }

  return resultado
}

/**
 * Verifica se um lote tem capacidade compartilhada
 */
export function temCapacidadeCompartilhada(lote: DashboardLotMetrics): boolean {
  return lote.grupoCapacidade?.id != null
}

/**
 * Formata o rótulo de capacidade para exibição
 */
export function formatarRotuloCapacidade(lote: DashboardLotMetrics, isEmGrupo: boolean): string {
  if (!isEmGrupo) return 'Capacidade individual'

  if (temCapacidadeCompartilhada(lote)) {
    return 'Vagas compartilhadas'
  }

  return 'Capacidade'
}
