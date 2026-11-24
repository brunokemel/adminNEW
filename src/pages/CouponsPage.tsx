import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Pencil, Plus, TicketPercent } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { adminApi } from '../api/admin'
import type { Coupon, CouponPayload } from '../types/dashboard'

const emptyForm: CouponPayload = { codigo: '', nomeEvento: '', desconto: 0 }
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function CouponsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CouponPayload>(emptyForm)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const eventsQuery = useQuery({ queryKey: ['coupon-events'], queryFn: adminApi.getCouponEvents })
  const couponsQuery = useQuery({ queryKey: ['coupons'], queryFn: adminApi.getCoupons })

  useEffect(() => {
    if (!form.nomeEvento && eventsQuery.data?.corridas.length) {
      setForm((current) => ({ ...current, nomeEvento: eventsQuery.data!.corridas[0] ?? '' }))
    }
  }, [eventsQuery.data, form.nomeEvento])

  const saveMutation = useMutation({
    mutationFn: adminApi.saveCoupon,
    onSuccess: async (response) => {
      setSuccessMessage(response.message ?? (editing ? 'Cupom atualizado.' : 'Cupom cadastrado.'))
      setForm(emptyForm)
      setEditing(null)
      await queryClient.invalidateQueries({ queryKey: ['coupons'] })
    },
  })

  const activeMutation = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => adminApi.setCouponActive(id, ativo),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['coupons'] }) },
  })

  function beginEdit(coupon: Coupon) {
    setEditing(coupon)
    setForm({ id: coupon.id, codigo: coupon.codigo, nomeEvento: coupon.nomeEvento, desconto: coupon.desconto })
    setFormError('')
    setSuccessMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditing(null)
    setForm({ ...emptyForm, nomeEvento: eventsQuery.data?.corridas[0] ?? '' })
    setFormError('')
    setSuccessMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setSuccessMessage('')
    const codigo = form.codigo.trim()
    if (!/^[a-zA-Z0-9_-]{3,40}$/.test(codigo)) {
      setFormError('O código deve ter de 3 a 40 caracteres: letras, números, hífen ou sublinhado.')
      return
    }
    if (!form.nomeEvento || !Number.isFinite(form.desconto) || form.desconto <= 0) {
      setFormError('Selecione um evento e informe um desconto maior que zero.')
      return
    }
    try {
      await saveMutation.mutateAsync({ ...form, codigo: codigo.toUpperCase(), desconto: Number(form.desconto) })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar o cupom.')
    }
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Vendas</p>
          <h1>Cupons de desconto</h1>
          <p>Cadastre códigos promocionais vinculados a uma corrida.</p>
        </div>
      </section>

      <section className="panel form-panel">
        <div className="panel__header">
          <div><h2>{editing ? 'Editar cupom' : 'Cadastrar cupom'}</h2><p>O desconto é um valor fixo em reais e será validado pela API.</p></div>
        </div>
        <form className="event-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="coupon-code">Código do cupom</label>
              <input id="coupon-code" value={form.codigo} onChange={(e) => setForm((c) => ({ ...c, codigo: e.target.value.toUpperCase() }))} placeholder="CORRE10" minLength={3} maxLength={40} required />
              <small>Letras, números, hífen e sublinhado.</small>
            </div>
            <div className="field">
              <label htmlFor="coupon-event">Corrida</label>
              <select id="coupon-event" value={form.nomeEvento} onChange={(e) => setForm((c) => ({ ...c, nomeEvento: e.target.value }))} required disabled={eventsQuery.isLoading || !eventsQuery.data?.corridas.length}>
                <option value="">{eventsQuery.isLoading ? 'Carregando corridas...' : 'Selecione uma corrida'}</option>
                {eventsQuery.data?.corridas.map((eventName) => <option key={eventName} value={eventName}>{eventName}</option>)}
              </select>
              {eventsQuery.isError && <small>Não foi possível carregar as corridas. Atualize a página.</small>}
              {eventsQuery.data?.corridas.length === 0 && <small>Nenhuma corrida com lotes cadastrados.</small>}
            </div>
            <div className="field">
              <label htmlFor="coupon-discount">Desconto</label>
              <div className="currency-input"><span>R$</span><input id="coupon-discount" type="number" min="0.01" step="0.01" value={form.desconto || ''} onChange={(e) => setForm((c) => ({ ...c, desconto: Number(e.target.value) }))} placeholder="10,00" required /></div>
            </div>
          </div>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          {successMessage && <p className="form-success" role="status"><CheckCircle2 size={18} />{successMessage}</p>}
          <div className="form-actions">
            {editing && <button className="button button--secondary" type="button" onClick={resetForm}>Cancelar edição</button>}
            <button className="button button--primary" disabled={saveMutation.isPending || !eventsQuery.data?.corridas.length}>
              {editing ? <Pencil size={17} /> : <Plus size={17} />}
              {saveMutation.isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar cupom'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel__header"><div><h2>Cupons cadastrados</h2><p>Ative ou desative cada código quando precisar.</p></div></div>
        {couponsQuery.isLoading ? <div className="content-state">Carregando cupons...</div> : couponsQuery.isError ? <div className="content-state content-state--error">Não foi possível carregar os cupons.</div> : couponsQuery.data?.cupons.length ? (
          <div className="table-wrap"><table><thead><tr><th>Código</th><th>Corrida</th><th>Desconto</th><th>Status</th><th>Ações</th></tr></thead><tbody>
            {couponsQuery.data.cupons.map((coupon) => <tr key={coupon.id}>
              <td data-label="Código"><strong className="coupon-code">{coupon.codigo}</strong></td>
              <td data-label="Corrida">{coupon.nomeEvento}</td>
              <td data-label="Desconto">{money.format(coupon.desconto)}</td>
              <td data-label="Status"><span className={`badge ${coupon.ativo ? '' : 'badge--warning'}`}>{coupon.ativo ? 'Ativo' : 'Inativo'}</span></td>
              <td data-label="Ações"><div className="coupon-actions">
                <button className="button button--secondary coupon-action" type="button" onClick={() => beginEdit(coupon)}><Pencil size={15} />Editar</button>
                <button className="button button--secondary coupon-action" type="button" disabled={activeMutation.isPending} onClick={() => activeMutation.mutate({ id: coupon.id, ativo: !coupon.ativo })}>{coupon.ativo ? 'Desativar' : 'Ativar'}</button>
              </div></td>
            </tr>)}
          </tbody></table></div>
        ) : <div className="content-state"><TicketPercent size={22} />Nenhum cupom cadastrado ainda.</div>}
        {activeMutation.isError && <p className="form-error coupon-list-error">{activeMutation.error instanceof Error ? activeMutation.error.message : 'Não foi possível alterar o status.'}</p>}
      </section>
    </>
  )
}
