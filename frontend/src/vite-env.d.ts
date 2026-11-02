/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Production: https://your-api.onrender.com/api/v1 */
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
