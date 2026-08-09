/**
 * Cliente HTTP framework-agnóstico (fetch nativo) para o backend real.
 * Cada app configura baseURL + como obter o token no bootstrap.
 */
export type ApiConfig = {
  baseURL: string;
  getToken: () => string | null;
};

declare global {
  interface Window {
    __bytebankApiBaseUrl?: string;
  }
}

const config: ApiConfig = {
  // Em produção o shell define window.__bytebankApiBaseUrl (ex.: '/api' na
  // mesma origem, atrás do Caddy). Em dev, cai no backend local.
  baseURL:
    (typeof window !== 'undefined' && window.__bytebankApiBaseUrl) ||
    'http://localhost:3000',
  // Por padrão lê o token do sessionStorage (compatível com a Fase 0).
  getToken: () =>
    typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null,
};

/** Sobrescreve baseURL e/ou provedor de token. Chamar no bootstrap do app. */
export function configureApi(partial: Partial<ApiConfig>): void {
  Object.assign(config, partial);
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function buildUrl(path: string): string {
  const base = config.baseURL.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = config.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(buildUrl(path), { ...options, headers });

  const text = await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : res.statusText) || `Erro ${res.status}`;
    throw new ApiError(res.status, message, data);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
