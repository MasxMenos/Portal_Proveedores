// src/utils/api.js

/**
 * apiFetch: Fetch wrapper que incluye automáticamente el token JWT
 * en el header Authorization, y lanza error si la respuesta no es OK.
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(path, { ...options, headers });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(
      `API error ${response.status}: ${response.statusText || text}`
    );
    error.status = response.status;
    error.body = text;
    throw error;
  }

  return response.json();
}
