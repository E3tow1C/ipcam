import { API_ROUTES } from '../constants/api-routes';

type RequestBody = Record<string, unknown> | FormData | null;

const fetchAPI = async (
  url: string,
  method: string,
  body: RequestBody = null,
  token: string | null = null
) => {
  try {
    const headers: Record<string, string> = {};

    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : null,
      ...(!token && { credentials: 'include' }),
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
}

export const uploadImage = async (image: File) => {
  try {
    const formData = new FormData();
    formData.append('file', image);

    const response = await fetchAPI(API_ROUTES.UPLOAD, 'POST', formData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const captureImage = async (): Promise<string> => {
  try {
    const response = await fetchAPI(API_ROUTES.IPCAM, 'GET');
    return response.image_url;
  } catch (error) {
    throw error;
  }
};
