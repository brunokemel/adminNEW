import {
  CATEGORIAS_LOTE,
  type CadastroEventoLotes,
  type LoteForm,
  type StatusLote,
} from '../types/events'

export function criarNovoLote(): LoteForm {
  return {
    id: '',
    lote: '',
    capacidade: 1,
    dataInicio: null,
    dataFim: null,
    viradaPorData: true,
    viradaPorCapacidade: true,
    ativo: true,
    grupoCapacidade: null,
    capacidadeGrupo: null,
    precos: CATEGORIAS_LOTE.map((categoria) => ({ categoria, valor: 0, ativo: true })),
  }
}

export function slug(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function sugerirKitId(evento: string, distancia: string, lote: string) {
  return [evento, distancia, lote].map(slug).filter(Boolean).join('-')
}

export function dataLocalParaIso(valor: string | null): string | null {
  if (!valor) return null
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) throw new Error('Data inválida.')
  return data.toISOString()
}

export function isoParaDataLocal(valor: string | null): string | null {
  if (!valor) return null
  const data = new Date(valor)
  const local = new Date(data.getTime() - data.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export function prepararCadastro(
  nomeEvento: string,
  distancia: string,
  lotes: LoteForm[],
): CadastroEventoLotes {
  return {
    nomeEvento: nomeEvento.trim(),
    distancia: distancia.trim(),
    lotes: lotes.map((lote) => ({
      id: lote.id.trim(),
      lote: lote.lote.trim(),
      capacidade: Number(lote.capacidade),
      ativo: lote.ativo,
      viradaPorData: lote.viradaPorData,
      viradaPorCapacidade: lote.viradaPorCapacidade,
      grupoCapacidade: lote.grupoCapacidade?.trim() || null,
      capacidadeGrupo: lote.grupoCapacidade ? Number(lote.capacidadeGrupo) : null,
      dataInicio: dataLocalParaIso(lote.dataInicio),
      dataFim: dataLocalParaIso(lote.dataFim),
      precos: lote.precos.map((preco) => ({ ...preco, valor: Number(preco.valor) })),
    })),
  }
}

export function validarCadastro(payload: CadastroEventoLotes) {
  if (!payload.nomeEvento) throw new Error('Informe o nome do evento.')
  if (!payload.distancia) throw new Error('Informe a distância.')
  if (!payload.lotes.length) throw new Error('Adicione pelo menos um lote.')

  const ids = new Set<string>()
  const nomes = new Set<string>()
  const grupos = new Map<string, number>()

  payload.lotes.forEach((lote, index) => {
    const posicao = index + 1
    if (!lote.id) throw new Error(`Informe o ID do lote ${posicao}.`)
    if (ids.has(lote.id)) throw new Error(`O ID ${lote.id} está duplicado.`)
    ids.add(lote.id)

    if (!lote.lote) throw new Error(`Informe o nome do lote ${posicao}.`)
    const nome = lote.lote.toLocaleLowerCase('pt-BR')
    if (nomes.has(nome)) throw new Error(`O nome ${lote.lote} está duplicado neste evento.`)
    nomes.add(nome)

    if (!Number.isInteger(lote.capacidade) || lote.capacidade <= 0) {
      throw new Error(`A capacidade do lote ${lote.lote} deve ser um inteiro maior que zero.`)
    }
    if (lote.dataInicio && lote.dataFim && new Date(lote.dataFim) <= new Date(lote.dataInicio)) {
      throw new Error(`A data final do lote ${lote.lote} deve ser posterior à inicial.`)
    }
    if (!lote.precos.length) throw new Error(`Informe pelo menos um preço para ${lote.lote}.`)

    const categorias = new Set<string>()
    lote.precos.forEach((preco) => {
      if (categorias.has(preco.categoria)) {
        throw new Error(`A categoria ${preco.categoria} está duplicada em ${lote.lote}.`)
      }
      categorias.add(preco.categoria)
      if (!Number.isFinite(preco.valor) || preco.valor < 0) {
        throw new Error(`Preço inválido na categoria ${preco.categoria}.`)
      }
    })

    if (lote.grupoCapacidade) {
      const capacidadeGrupo = Number(lote.capacidadeGrupo)
      if (!Number.isInteger(lote.capacidadeGrupo) || Number(lote.capacidadeGrupo) <= 0) {
        throw new Error(`Informe a capacidade compartilhada de ${lote.lote}.`)
      }
      const totalAnterior = grupos.get(lote.grupoCapacidade)
      if (totalAnterior !== undefined && totalAnterior !== capacidadeGrupo) {
        throw new Error(`Todos os lotes do grupo ${lote.grupoCapacidade} devem usar a mesma capacidade total.`)
      }
      grupos.set(lote.grupoCapacidade, capacidadeGrupo)
    }
  })
}

export function statusParaLote(status: StatusLote): LoteForm {
  return {
    id: status.id,
    lote: status.lote,
    capacidade: status.capacidade,
    dataInicio: isoParaDataLocal(status.dataInicio),
    dataFim: isoParaDataLocal(status.dataFim),
    viradaPorData: status.viradaPorData,
    viradaPorCapacidade: status.viradaPorCapacidade,
    ativo: status.ativo,
    grupoCapacidade: status.grupoCapacidade,
    capacidadeGrupo: status.capacidadeGrupo,
    precos: CATEGORIAS_LOTE.map((categoria) => {
      const preco = status.precos.find((item) => item.categoria === categoria)
      return { categoria, valor: preco?.valor ?? 0, ativo: Boolean(preco) }
    }),
    existente: true,
  }
}
