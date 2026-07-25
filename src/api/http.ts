const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

if (!apiUrl) {
  throw new Error('VITE_API_URL não foi configurada. Copie .env.example para .env.')
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function buildUrl(path: string, query?: Record<string, string | undefined>) {
  const url = new URL(`${apiUrl}${path}`)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value)
  })

  return url.toString()
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  query?: Record<string, string | undefined>,
): Promise<T> {
  const response = await fetch(buildUrl(path, query), {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-Admin-Client': '1kmzinho-dashboard',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '')

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload && 'message' in payload
        ? String(payload.message)
        : `Não foi possível concluir a solicitação (${response.status}).`

    throw new ApiError(message, response.status, payload)
  }

  return payload as T
}

export async function downloadProtectedFile(
  path: string,
  fileName: string,
): Promise<void> {
  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    headers: {
      Accept: 'application/pdf',
      'X-Admin-Client': '1kmzinho-dashboard',
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new ApiError(
      payload?.message ?? 'Não foi possível baixar o relatório.',
      response.status,
      payload,
    )
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}
