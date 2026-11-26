export const API_V1 = '/api/v1';

let accessToken = null;

export function setAuthToken(token) {
  accessToken = token || null;
}

export function getAuthToken() {
  return accessToken;
}

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_V1}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) {
    const err = new Error(json?.error?.message || json?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.fields = json?.error?.fields || json?.errors;
    throw err;
  }
  return json.data !== undefined ? json.data : json;
}

