/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DASHBOARD_URL?: string;
  readonly VITE_TRANSACOES_URL?: string;
  readonly VITE_API_URL?: string;
}

interface Window {
  __bytebankApiBaseUrl?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
