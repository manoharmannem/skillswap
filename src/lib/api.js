const PRODUCTION_API_URL = "https://skillswap-delta-tan.vercel.app";

const API_URL = (
  import.meta.env.DEV
    ? (import.meta.env.VITE_API_URL || "http://localhost:5000")
    : PRODUCTION_API_URL
).replace(/\/$/, "");

const TOKEN_KEY = "skillswap:token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function api(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    // Ignore non-JSON responses
  }

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export { API_URL };