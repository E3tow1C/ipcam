import { API_ROUTES } from '../constants/api-routes';
import Cookies from 'js-cookie';

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
      credentials: 'include',
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

export const getFilteredImages = async (source: string, fromDate: string, toDate: string): Promise<string[]> => {
  try {
    const response = await fetchAPI(API_ROUTES.IMAGES.FILTER(source, fromDate, toDate), 'GET');
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
  username?: string;
  password?: string;
  authType?: "basic" | "digest";
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

export const deleteCamera = async (id: string): Promise<boolean> => {
  try {
    const accessToken = Cookies.get('access_token');
    const response = await fetchAPI(API_ROUTES.CAMERA.BY_ID(id), 'DELETE', null, accessToken);

    return response.status === 'completed';
  } catch (error) {
    throw error;
  }
};

export const addCamera = async (name: string, url: string, location: string, username?: string, password?: string, authType?: string): Promise<CameraData> => {
  try {
    const accessToken = Cookies.get('access_token');
    const response = await fetchAPI(API_ROUTES.CAMERA.POST, 'POST', { name, url, location, username, password, authType }, accessToken);
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
      body: formData,
      credentials: "include",
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

export const authLogout = async (): Promise<boolean> => {
  try {
    const response = await fetchAPI(API_ROUTES.AUTH.LOGOUT, 'GET');
    return response.success;
  } catch (error) {
    throw error;
  }
};

export const createNewAccount = async (userCredential: userCredential, token?: string): Promise<loginResponse> => {
  try {
    const response: loginResponse = await fetchAPI(API_ROUTES.ACCOUNTS.CREATE, 'POST', {
      username: userCredential.username,
      password: userCredential.password
    }, token);

    return response;
  } catch (error) {
    throw error;
  }
};

export type Account = {
  _id: string;
  username: string;
};

export const updateCamera = async (id: string, name: string, url: string, location: string, username?: string, password?: string, authType?: string): Promise<boolean> => {
  try {
    const accessToken = Cookies.get('access_token');
    const response = await fetchAPI(API_ROUTES.CAMERA.BY_ID(id), 'PATCH', { name, url, location, username, password, authType }, accessToken);
    return response.success;
  } catch (error) {
    throw error;
  }
}

export const getAllAccounts = async (token: string): Promise<Account[]> => {
  try {
    const response = await fetchAPI(API_ROUTES.ACCOUNTS.ALL, 'GET', null, token);
    if (!response.success) {
      return response.message;
    }
    return response.accounts;
  } catch (error) {
    throw error;
  }
}

export const deleteAccount = async (id: string, token: string): Promise<boolean> => {
  try {
    const response = await fetchAPI(API_ROUTES.ACCOUNTS.DELETE(id), 'DELETE', null, token);
    return response.success;
  } catch (error) {
    throw error;
  }
}

export type Credential = {
  _id: string;
  name: string;
  host: string;
  expire: Date;
  secret: string;
};

export const getAllCredentials = async (token: string): Promise<Credential[]> => {
  try {
    const response = await fetchAPI(API_ROUTES.CREDENTIALS.ALL, 'GET', null, token);
    return response.credentials;
  } catch (error) {
    throw error;
  }
}

export const createNewCredential = async (name: string, host: string, expire?: Date): Promise<boolean> => {
  try {
    const token = Cookies.get('access_token');
    const response = await fetchAPI(API_ROUTES.CREDENTIALS.CREATE, 'POST', { name, host, expire }, token);
    return response.success;
  } catch (error) {
    throw error;
  }
}

export const deleteCredential = async (id: string, token: string): Promise<boolean> => {
  try {
    const response = await fetchAPI(API_ROUTES.CREDENTIALS.BY_ID(id), 'DELETE', null, token);
    return response.success;
  } catch (error) {
    throw error;
  }
}