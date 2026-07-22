export const customFetch_original = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('auth_token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, ...errorData };
  }
  
  return response.json() as Promise<T>;
};
