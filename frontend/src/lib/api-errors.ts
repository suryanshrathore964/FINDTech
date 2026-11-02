import axios from 'axios'

/** Extract a user-facing message from an API or network error. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0]
      if (typeof first === 'object' && first && 'msg' in first) {
        return String((first as { msg: string }).msg)
      }
    }
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'Request timed out. The server may be starting up — try again in a moment.'
    }
    if (!error.response) {
      return 'Cannot reach the API. Make sure the backend is running on port 8000.'
    }
    if (error.response.status === 503) {
      return 'Database is unavailable. Check backend configuration or use USE_MEMORY_DB=true.'
    }
    if (error.response.status >= 500) {
      return 'Server error. Please try again shortly.'
    }
  }
  return fallback
}
