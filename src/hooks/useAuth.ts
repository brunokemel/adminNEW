import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin'

export const sessionQueryKey = ['admin-session'] as const

export function useAdminSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: adminApi.getSession,
    retry: false,
    staleTime: 30_000,
  })
}

export function useAdminLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminApi.login,
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryKey, session)
    },
  })
}

export function useAdminLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminApi.logout,
    onSettled: () => {
      queryClient.clear()
    },
  })
}
