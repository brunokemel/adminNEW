import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminApi } from '../api/admin'
import type { LoteForm } from '../types/events'
import {
  criarNovoLote,
  prepararCadastro,
  statusParaLote,
  sugerirKitId,
  validarCadastro,
} from '../utils/eventForm'

const ROTULOS_CATEGORIA = {
  MASCULINO: 'Masculino',
  FEMININO: 'Feminino',
  MAIOR_60: 'Maior de 60',
  LGBTQIA: 'LGBTQIA+',
  PCD: 'PCD',
} as const

export function NewEventPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [nomeEvento, setNomeEvento] = useState('')
  const [distancia, setDistancia] = useState('')
  const [lotes, setLotes] = useState<LoteForm[]>([criarNovoLote()])
  const [abertos, setAbertos] = useState<Set<number>>(new Set([0]))
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  const statusQuery = useQuery({
    queryKey: ['lot-status'],
    queryFn: () => adminApi.getLotStatus(),
    staleTime: 5_000,
  })

  const eventos = useMemo(
    () => [...new Set(statusQuery.data?.lotes.map((lote) => lote.nomeEvento) ?? [])].sort(),
    [statusQuery.data],
  )

  const salvar = useMutation({
    mutationFn: adminApi.createEventLot,
    onSuccess: async (resposta) => {
      setConfirmando(false)
      setSucesso(
        resposta.lotesSalvos?.length
          ? `${resposta.message}: ${resposta.lotesSalvos.map((lote) => lote.id).join(', ')}`
          : resposta.message || 'Evento e lotes salvos com sucesso.',
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['lot-status'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-events'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
      ])
    },
    onError: (error) => {
      setConfirmando(false)
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar os lotes.')
    },
  })

  useEffect(() => {
    const unauthorized = () => navigate('/login', { replace: true })
    window.addEventListener('admin:unauthorized', unauthorized)
    return () => window.removeEventListener('admin:unauthorized', unauthorized)
  }, [navigate])

  function atualizarLote(index: number, patch: Partial<LoteForm>) {
    setLotes((atuais) =>
      atuais.map((lote, atual) => (atual === index ? { ...lote, ...patch } : lote)),
    )
  }

  function atualizarNomeLote(index: number, nome: string) {
    setLotes((atuais) =>
      atuais.map((lote, atual) => {
        if (atual !== index) return lote
        const sugestaoAnterior = sugerirKitId(nomeEvento, distancia, lote.lote)
        return {
          ...lote,
          lote: nome,
          id:
            !lote.existente && (!lote.id || lote.id === sugestaoAnterior)
              ? sugerirKitId(nomeEvento, distancia, nome)
              : lote.id,
        }
      }),
    )
  }

  function adicionarLote() {
    setLotes((atuais) => {
      setAbertos((indices) => new Set(indices).add(atuais.length))
      return [...atuais, criarNovoLote()]
    })
  }

  function duplicarLote(index: number) {
    const original = lotes[index]
    if (!original) return
    const copia = structuredClone(original)
    copia.id = `${copia.id || sugerirKitId(nomeEvento, distancia, copia.lote)}-copia`
    copia.lote = `${copia.lote} (cópia)`
    copia.existente = false
    setLotes((atuais) => [...atuais, copia])
    setAbertos((indices) => new Set(indices).add(lotes.length))
  }

  function removerLote(index: number) {
    setLotes((atuais) => atuais.filter((_, atual) => atual !== index))
    setAbertos((indices) => {
      const proximos = new Set<number>()
      indices.forEach((item) => {
        if (item < index) proximos.add(item)
        if (item > index) proximos.add(item - 1)
      })
      return proximos
    })
  }

  function selecionarEvento(evento: string) {
    if (!evento) return
    const encontrados = statusQuery.data?.lotes.filter((lote) => lote.nomeEvento === evento) ?? []
    setNomeEvento(evento)
    setDistancia(encontrados[0]?.distancia ?? '')
    setLotes(encontrados.map(statusParaLote))
    setAbertos(new Set(encontrados.map((_, index) => index)))
    setErro('')
    setSucesso('')
  }

  function preparar() {
    const payload = prepararCadastro(nomeEvento, distancia, lotes)
    validarCadastro(payload)
    return payload
  }

  function solicitarConfirmacao(event: FormEvent) {
    event.preventDefault()
    setErro('')
    setSucesso('')
    try {
      preparar()
      setConfirmando(true)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Revise os dados informados.')
    }
  }

  return (
    <>
      <section className="page-heading page-heading--with-back">
        <Link className="back-link" to="/"><ArrowLeft size={18} />Voltar ao painel</Link>
        <div>
          <p className="eyebrow">Configuração</p>
          <h1>Eventos e lotes</h1>
          <p>Cadastre capacidades, períodos de venda e preços por categoria.</p>
        </div>
      </section>

      <section className="event-workspace">
        <div className="event-toolbar">
          <div className="field">
            <label htmlFor="existing-event">Editar evento existente</label>
            <select
              id="existing-event"
              value={eventos.includes(nomeEvento) ? nomeEvento : ''}
              onChange={(event) => selecionarEvento(event.target.value)}
              disabled={statusQuery.isLoading}
            >
              <option value="">{statusQuery.isLoading ? 'Carregando...' : 'Selecione um evento'}</option>
              {eventos.map((evento) => <option key={evento}>{evento}</option>)}
            </select>
            <small>A consulta pública exibe apenas preços ativos.</small>
          </div>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => {
              setNomeEvento('')
              setDistancia('')
              setLotes([criarNovoLote()])
              setAbertos(new Set([0]))
              setErro('')
              setSucesso('')
            }}
          >
            <Plus size={17} />Novo evento
          </button>
        </div>

        <form className="event-editor" onSubmit={solicitarConfirmacao}>
          <section className="event-basics">
            <div className="field">
              <label htmlFor="event-name">Nome do evento</label>
              <input id="event-name" value={nomeEvento} onChange={(e) => setNomeEvento(e.target.value)} maxLength={160} required />
            </div>
            <div className="field">
              <label htmlFor="distance">Distância</label>
              <input id="distance" value={distancia} onChange={(e) => setDistancia(e.target.value)} maxLength={60} required />
            </div>
            <button className="button button--secondary" type="button" onClick={adicionarLote}>
              <Plus size={17} />Adicionar lote
            </button>
          </section>

          <div className="lot-editor-list">
            {lotes.map((lote, index) => {
              const aberto = abertos.has(index)
              const compartilhar = Boolean(lote.grupoCapacidade)
              return (
                <article className="lot-editor" key={index}>
                  <header className="lot-editor__header">
                    <button
                      className="lot-editor__toggle"
                      type="button"
                      onClick={() => setAbertos((atuais) => {
                        const proximos = new Set(atuais)
                        if (proximos.has(index)) proximos.delete(index)
                        else proximos.add(index)
                        return proximos
                      })}
                      aria-expanded={aberto}
                    >
                      {aberto ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
                      <span><strong>{lote.lote || `Lote ${index + 1}`}</strong><small>{lote.id || 'ID ainda não definido'}</small></span>
                    </button>
                    <div className="lot-editor__actions">
                      <button className="icon-button" type="button" title="Duplicar lote" aria-label="Duplicar lote" onClick={() => duplicarLote(index)}><Copy size={17} /></button>
                      <button className="icon-button icon-button--danger" type="button" title="Remover da lista" aria-label="Remover da lista" onClick={() => removerLote(index)}><Trash2 size={17} /></button>
                    </div>
                  </header>

                  {aberto && (
                    <div className="lot-editor__body">
                      <div className="form-grid">
                        <div className="field">
                          <label htmlFor={`lot-name-${index}`}>Nome do lote</label>
                          <input id={`lot-name-${index}`} value={lote.lote} onChange={(e) => atualizarNomeLote(index, e.target.value)} required />
                        </div>
                        <div className="field">
                          <label htmlFor={`lot-id-${index}`}>ID / kitId</label>
                          <input id={`lot-id-${index}`} value={lote.id} disabled={lote.existente} onChange={(e) => atualizarLote(index, { id: e.target.value })} required />
                          <small>{lote.existente ? 'O ID de um lote existente não pode ser alterado.' : 'Usado diretamente pelo checkout.'}</small>
                        </div>
                        <div className="field">
                          <label htmlFor={`capacity-${index}`}>Capacidade</label>
                          <input id={`capacity-${index}`} type="number" min="1" step="1" value={lote.capacidade} onChange={(e) => atualizarLote(index, { capacidade: Number(e.target.value) })} required />
                        </div>
                        <div className="field">
                          <label htmlFor={`start-${index}`}>Início das vendas</label>
                          <input id={`start-${index}`} type="datetime-local" value={lote.dataInicio ?? ''} onChange={(e) => atualizarLote(index, { dataInicio: e.target.value || null })} />
                        </div>
                        <div className="field">
                          <label htmlFor={`end-${index}`}>Encerramento das vendas</label>
                          <input id={`end-${index}`} type="datetime-local" value={lote.dataFim ?? ''} onChange={(e) => atualizarLote(index, { dataFim: e.target.value || null })} />
                        </div>
                      </div>

                      <div className="switch-grid">
                        <Switch label="Lote ativo" checked={lote.ativo} onChange={(ativo) => atualizarLote(index, { ativo })} />
                        <Switch label="Controlar por data" checked={lote.viradaPorData} onChange={(viradaPorData) => atualizarLote(index, { viradaPorData })} />
                        <Switch label="Controlar por capacidade" checked={lote.viradaPorCapacidade} onChange={(viradaPorCapacidade) => atualizarLote(index, { viradaPorCapacidade })} />
                        <Switch
                          label="Compartilhar capacidade"
                          checked={compartilhar}
                          onChange={(checked) => atualizarLote(index, {
                            grupoCapacidade: checked ? sugerirKitId(nomeEvento, distancia, 'geral') : null,
                            capacidadeGrupo: checked ? lote.capacidade : null,
                          })}
                        />
                      </div>

                      {compartilhar && (
                        <div className="shared-fields">
                          <div className="field">
                            <label htmlFor={`group-${index}`}>Identificador do grupo</label>
                            <input id={`group-${index}`} value={lote.grupoCapacidade ?? ''} onChange={(e) => atualizarLote(index, { grupoCapacidade: e.target.value || null })} required />
                          </div>
                          <div className="field">
                            <label htmlFor={`group-capacity-${index}`}>Capacidade total do grupo</label>
                            <input id={`group-capacity-${index}`} type="number" min="1" step="1" value={lote.capacidadeGrupo ?? ''} onChange={(e) => atualizarLote(index, { capacidadeGrupo: Number(e.target.value) })} required />
                          </div>
                        </div>
                      )}

                      <fieldset className="category-prices">
                        <legend>Preços por categoria</legend>
                        {lote.precos.map((preco, precoIndex) => (
                          <div className="category-price" key={preco.categoria}>
                            <strong>{ROTULOS_CATEGORIA[preco.categoria]}</strong>
                            <div className="currency-input"><span>R$</span><input aria-label={`Preço ${ROTULOS_CATEGORIA[preco.categoria]}`} type="number" min="0" step="0.01" value={preco.valor} onChange={(e) => atualizarLote(index, { precos: lote.precos.map((item, atual) => atual === precoIndex ? { ...item, valor: Number(e.target.value) } : item) })} /></div>
                            <Switch label="Ativo" compact checked={preco.ativo} onChange={(ativo) => atualizarLote(index, { precos: lote.precos.map((item, atual) => atual === precoIndex ? { ...item, ativo } : item) })} />
                          </div>
                        ))}
                      </fieldset>
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          {erro && <p className="form-error" role="alert">{erro}</p>}
          {sucesso && <p className="form-success" role="status"><CheckCircle2 size={18} />{sucesso}</p>}
          <div className="form-actions">
            <Link className="button button--secondary" to="/">Cancelar</Link>
            <button className="button button--primary" disabled={salvar.isPending || !lotes.length}><Save size={17} />Salvar evento e lotes</button>
          </div>
        </form>
      </section>

      {confirmando && (
        <div className="modal-backdrop" role="presentation">
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <header><div><p className="eyebrow">Confirmação</p><h2 id="confirm-title">Salvar evento e lotes?</h2></div><button className="icon-button" type="button" aria-label="Fechar" onClick={() => setConfirmando(false)}><X size={18} /></button></header>
            <p><strong>{nomeEvento}</strong> · {distancia}</p>
            <ul>{lotes.map((lote) => <li key={lote.id}><span>{lote.lote}</span><strong>{lote.capacidade} vagas · {lote.precos.filter((preco) => preco.ativo).length} preços ativos</strong></li>)}</ul>
            <div className="form-actions">
              <button className="button button--secondary" type="button" onClick={() => setConfirmando(false)}>Revisar</button>
              <button className="button button--primary" type="button" disabled={salvar.isPending} onClick={() => salvar.mutate(preparar())}>{salvar.isPending ? 'Salvando...' : 'Confirmar e salvar'}</button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

function Switch({ label, checked, onChange, compact = false }: { label: string; checked: boolean; onChange: (checked: boolean) => void; compact?: boolean }) {
  return (
    <label className={`switch-control ${compact ? 'switch-control--compact' : ''}`}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span aria-hidden="true" />
      <strong>{label}</strong>
    </label>
  )
}
