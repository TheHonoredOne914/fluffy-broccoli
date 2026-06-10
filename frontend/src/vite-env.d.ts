/// <reference types="vite/client" />

declare const __API_BASE__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_URL?: string;
}
