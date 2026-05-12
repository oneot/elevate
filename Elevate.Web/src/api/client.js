export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://func-elv-server-ep-dev.azurewebsites.net/api/public';

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, options);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.code = body.code;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}
