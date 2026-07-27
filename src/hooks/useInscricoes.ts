import { useQuery } from '@tanstack/react-query'
import type { DashboardFilters } from '../types/dashboard'
import { adminApi } from '../api/admin'

export function useInscricoes(filters: DashboardFilters, enabled = true) {
  return useQuery({
    queryKey: ['inscricoes', filters],
    queryFn: () => adminApi.getInscricoes(filters),
    select: (response) => response?.inscricoes ?? [],
    staleTime: 30_000,
    enabled,
  })
}
