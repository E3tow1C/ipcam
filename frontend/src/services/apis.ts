import { API_ROUTES } from '../constants/api-routes';

const fetchAPI = async (url: string, method: string, body: any = null, token: string | null = null) => {
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
    ...(!token && { credentials: 'include' })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || 'Something went wrong');
  }

  return data;
};

export const getBlogs = async () => {
  try {
    const response = await fetchAPI(API_ROUTES.IPCAM.GET, 'GET', null);
    return response;
  } catch (error) {
    throw error;
  }
};