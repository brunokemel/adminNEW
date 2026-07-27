import { useQuery } from '@tanstack/react-query'
import type { DashboardFilters } from '../types/dashboard'
import { adminApi } from '../api/admin'

export function useInscricoes(filters: DashboardFilters, enabled = true) {
  return useQuery({
    queryKey: ['inscricoes', { ...filters, pagina: 1, limite: 100 }],
    queryFn: () => adminApi.getInscricoes({ ...filters, pagina: 1, limite: 100 }),
    select: (response) => response?.inscricoes ?? [],
    staleTime: 30_000,
    enabled,
  })
}

export function usePedidosPage(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['pedidos-page', filters],
    queryFn: () => adminApi.getInscricoes(filters),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  })
}
