import type { Inscricao } from '../types/dashboard'

export const SHIRT_SIZES = ['PP', 'P', 'M', 'G', 'GG'] as const

export function hasApiField(inscricao: Inscricao, field: keyof Inscricao) {
  return Object.prototype.hasOwnProperty.call(inscricao, field)
}

export function formatTeam(inscricao: Inscricao) {
  if (!hasApiField(inscricao, 'equipe')) return 'Sem dados'
  return typeof inscricao.equipe === 'string' && inscricao.equipe.trim()
    ? inscricao.equipe.trim()
    : 'Sem equipe'
}

export function formatShirtSize(inscricao: Inscricao) {
  if (!hasApiField(inscricao, 'numeroCamisa')) return 'Sem dados'
  return typeof inscricao.numeroCamisa === 'string' && inscricao.numeroCamisa.trim()
    ? inscricao.numeroCamisa.trim().toUpperCase()
    : 'Não informado'
}

export function formatRegistrationNumber(inscricao: Inscricao) {
  if (!hasApiField(inscricao, 'numeroInscricao')) return 'Sem dados'
  if (inscricao.numeroInscricao === null || inscricao.numeroInscricao === undefined || inscricao.numeroInscricao === '') {
    return 'Aguardando aprovação'
  }

  const value = String(inscricao.numeroInscricao).trim()
  return /^\d+$/.test(value) ? value.padStart(4, '0') : value
}
