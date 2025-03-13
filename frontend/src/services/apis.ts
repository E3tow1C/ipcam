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

export const getAllImages = async (): Promise<string[]> => {
  try {
    const response = await fetchAPI(API_ROUTES.IMAGES.ALL, 'GET');
    return response.all_image_urls;
  } catch (error) {
    throw error;
  }
};

export type CameraData = {
  _id: { $oid: string };
  name: string;
  url: string;
  location: string;
};

export const getAllCameras = async (): Promise<CameraData[]> => {
  try {
    const response = await fetchAPI(API_ROUTES.CAMERAS.ALL, 'GET');
    return response.cameras;
  } catch (error) {
    throw error;
  }
};

export const getCamerasByLocation = async (location: string): Promise<CameraData[]> => {
  try {
    const response = await fetchAPI(API_ROUTES.CAMERAS.BY_LOCATION(location), 'GET');
    return response.cameras;
  } catch (error) {
    throw error;
  }
}

export const addCamera = async (name: string, url: string, location: string): Promise<CameraData> => {
  try {
    const response = await fetchAPI(API_ROUTES.CAMERA.POST, 'POST', { name, url, location });
    return response.camera;
  }
  catch (error) {
    throw error;
  }
};

export const getCameraById = async (id: string): Promise<CameraData> => {
  try {
    const response = await fetchAPI(API_ROUTES.CAMERA.BY_ID(id), 'GET');
    return response.camera;
  } catch (error) {
    throw error;
  }
};

export const captureCameraImage = async (id: string): Promise<string> => {
  try {
    const response = await fetchAPI(API_ROUTES.CAMERA.CAPTURE(id), 'GET');
    return response.image_url;
  } catch (error) {
    throw error;
  }
};

export type userCredential = {
  username: string;
  password: string;
};

export type loginResponse = {
  success: boolean;
  message: string;
};

export const authLogin = async (userCredential: userCredential): Promise<loginResponse> => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', userCredential.username);
    formData.append('password', userCredential.password);

    const response = await fetch(API_ROUTES.AUTH.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    });

    const responseData = await response.json();

    if (response.ok) {
      const data: loginResponse = {
        success: true,
        message: "Login successful",
      };

      return data;
    }

    if (response.status === 401) {
      const data: loginResponse = {
        success: false,
        message: responseData.detail,
      };
      return data;
    }

    return {
      success: false,
      message: "Something went wrong",
    };

  } catch (error) {
    throw error;
  }
}