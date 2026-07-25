import type { PeriodPreset } from '../types/dashboard'

const TIME_ZONE = 'America/Sao_Paulo'

function zonedDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)

  return { year: get('year'), month: get('month'), day: get('day') }
}

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function shiftDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1))
  date.setUTCDate(date.getUTCDate() + days)
  return toIsoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

export function todayInSaoPaulo() {
  const { year, month, day } = zonedDateParts()
  return toIsoDate(year, month, day)
}

export function getDateRange(preset: PeriodPreset) {
  const today = todayInSaoPaulo()
  const [year, month] = today.split('-').map(Number)

  if (preset === '7days') {
    return { dataInicio: shiftDays(today, -6), dataFim: today }
  }

  if (preset === 'month') {
    return {
      dataInicio: toIsoDate(year ?? 0, month ?? 1, 1),
      dataFim: today,
    }
  }

  return { dataInicio: today, dataFim: today }
}
