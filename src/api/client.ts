import axios from 'axios';

// Plain client for auth endpoints — no interceptors to avoid infinite refresh loops
export const authClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Authenticated client — interceptors added in AuthContext after it mounts
export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});
