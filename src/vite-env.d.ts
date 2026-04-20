/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NOMINATIM_USER_AGENT?: string;
  readonly VITE_NOMINATIM_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
