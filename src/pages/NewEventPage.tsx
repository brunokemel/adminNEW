import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../api/admin'
import type { NewEventLotPayload } from '../types/dashboard'

const initialForm: NewEventLotPayload = {
  nomeEvento: '',
  distancia: '',
  lote: '',
  capacidade: 0,
  grupoCapacidade: '',
  precos: [0],
  ativo: true,
}

export function NewEventPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<NewEventLotPayload>(initialForm)
  const [successMessage, setSuccessMessage] = useState('')
  const [formError, setFormError] = useState('')

  const createMutation = useMutation({
    mutationFn: adminApi.createEventLot,
    onSuccess: async (response) => {
      setSuccessMessage(response.message ?? 'Evento/lote cadastrado com sucesso.')
      setForm(initialForm)
      await queryClient.invalidateQueries({ queryKey: ['dashboard-events'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })

  function updatePrice(index: number, value: number) {
    setForm((current) => ({
      ...current,
      precos: current.precos.map((price, currentIndex) =>
        currentIndex === index ? value : price,
      ),
    }))
  }

  function removePrice(index: number) {
    setForm((current) => ({
      ...current,
      precos: current.precos.filter((_, currentIndex) => currentIndex !== index),
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setSuccessMessage('')

    if (!form.nomeEvento.trim() || !form.lote.trim() || form.capacidade <= 0) {
      setFormError('Preencha o evento, o lote e uma capacidade maior que zero.')
      return
    }

    if (form.precos.length === 0 || form.precos.some((price) => price < 0)) {
      setFormError('Informe pelo menos um preço válido.')
      return
    }

    try {
      await createMutation.mutateAsync({
        ...form,
        grupoCapacidade: form.grupoCapacidade?.trim() || undefined,
        precos: form.precos.map(Number),
      })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível cadastrar o lote.')
    }
  }

  return (
    <>
      <section className="page-heading page-heading--with-back">
        <Link className="back-link" to="/">
          <ArrowLeft size={18} />
          Voltar ao painel
        </Link>
        <div>
          <p className="eyebrow">Cadastro</p>
          <h1>Novo evento/lote</h1>
          <p>O formulário envia os dados somente para a API Node/Express existente.</p>
        </div>
      </section>

      <section className="panel form-panel">
        <div className="panel__header">
          <div>
            <h2>Dados da opção de inscrição</h2>
            <p>Use o mesmo grupo de capacidade para kits que compartilham vagas.</p>
          </div>
        </div>

        <form className="event-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field field--span-2">
              <label htmlFor="event-name">Nome do evento</label>
              <input
                id="event-name"
                value={form.nomeEvento}
                onChange={(event) => setForm((current) => ({ ...current, nomeEvento: event.target.value }))}
                placeholder="Ex.: Juntos Rumo ao Céu 2026"
                maxLength={160}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="distance">Distância</label>
              <input
                id="distance"
                value={form.distancia}
                onChange={(event) => setForm((current) => ({ ...current, distancia: event.target.value }))}
                placeholder="Ex.: 5 km"
                maxLength={60}
              />
            </div>

            <div className="field">
              <label htmlFor="lot">Kit/lote</label>
              <input
                id="lot"
                value={form.lote}
                onChange={(event) => setForm((current) => ({ ...current, lote: event.target.value }))}
                placeholder="Ex.: Kit completo — lote único"
                maxLength={120}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="capacity">Capacidade</label>
              <input
                id="capacity"
                type="number"
                min="1"
                step="1"
                value={form.capacidade || ''}
                onChange={(event) => setForm((current) => ({ ...current, capacidade: Number(event.target.value) }))}
                placeholder="300"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="capacity-group">Grupo de capacidade</label>
              <input
                id="capacity-group"
                value={form.grupoCapacidade ?? ''}
                onChange={(event) => setForm((current) => ({ ...current, grupoCapacidade: event.target.value }))}
                placeholder="Ex.: EVENTO-5K-VAGAS"
                maxLength={100}
              />
              <small>Kits simples e completos com as mesmas vagas devem usar o mesmo valor.</small>
            </div>
          </div>

          <fieldset className="prices-fieldset">
            <legend>Preços</legend>
            <div className="price-list">
              {form.precos.map((price, index) => (
                <div className="price-row" key={index}>
                  <div className="field">
                    <label htmlFor={`price-${index}`}>Preço {index + 1}</label>
                    <div className="currency-input">
                      <span>R$</span>
                      <input
                        id={`price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={price || ''}
                        onChange={(event) => updatePrice(index, Number(event.target.value))}
                        placeholder="85,00"
                        required
                      />
                    </div>
                  </div>
                  {form.precos.length > 1 && (
                    <button
                      className="icon-button icon-button--danger"
                      type="button"
                      aria-label={`Remover preço ${index + 1}`}
                      onClick={() => removePrice(index)}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              className="button button--ghost-inline"
              type="button"
              onClick={() => setForm((current) => ({ ...current, precos: [...current.precos, 0] }))}
            >
              <Plus size={17} />
              Adicionar outro preço
            </button>
          </fieldset>

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(event) => setForm((current) => ({ ...current, ativo: event.target.checked }))}
            />
            <span>
              <strong>Lote ativo</strong>
              <small>Disponível para listagem e métricas administrativas.</small>
            </span>
          </label>

          {formError && <p className="form-error" role="alert">{formError}</p>}
          {successMessage && (
            <p className="form-success" role="status">
              <CheckCircle2 size={18} />
              {successMessage}
            </p>
          )}

          <div className="form-actions">
            <Link className="button button--secondary" to="/">Cancelar</Link>
            <button className="button button--primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Salvando...' : 'Cadastrar evento/lote'}
            </button>
          </div>
        </form>
      </section>
    </>
  )
}
