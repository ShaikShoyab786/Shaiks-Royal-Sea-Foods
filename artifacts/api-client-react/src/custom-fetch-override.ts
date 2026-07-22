// Import the generated schemas
import type { ErrorType } from './custom-fetch';

export const customFetch = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('auth_token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Prefix API calls with /api to hit the proxy
  const finalUrl = url.startsWith('/api') ? url : `/api${url}`;
  
  const response = await fetch(finalUrl, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, ...errorData };
  }
  
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json() as Promise<T>;
};

export type { ErrorType, BodyType } from './custom-fetch';
