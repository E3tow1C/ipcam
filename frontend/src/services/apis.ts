import { API_ROUTES } from '../constants/api-routes';

const fetchAPI = async (url: string, method: string, body: any = null, token: string | null = null) => {
  try {
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
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`API request failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const getBlogs = async () => {
  try {
    const response = await fetchAPI(API_ROUTES.IPCAM.GET, 'GET', null);
    return response;
  } catch (error) {
    throw error;
  }
};

export const uploadImage = async (image: File) => {
  try {
    const formData = new FormData();
    formData.append('image', image);

    const response = await fetchAPI(API_ROUTES.UPLOAD, 'POST', formData);
    return response;
  } catch (error) {
    throw error;
  }
}