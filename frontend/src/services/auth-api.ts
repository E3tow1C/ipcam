import { API_ROUTES } from '@/constants/api-routes';
import { apiRequest } from '@/utils/api-helpers';

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
      return {
        success: true,
        message: "Login successful",
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        message: responseData.detail,
      };
    }

    return {
      success: false,
      message: "Something went wrong",
    };
  } catch (error) {
    throw error;
  }
};

export const authLogout = async (): Promise<boolean> => {
  const response = await apiRequest<{ success: boolean }>(API_ROUTES.AUTH.LOGOUT, 'GET');
  return response.success;
};

export type Account = {
  _id: string;
  username: string;
};

export const createNewAccount = async (userCredential: userCredential, token?: string): Promise<loginResponse> => {
  return await apiRequest<loginResponse>(
    API_ROUTES.ACCOUNTS.CREATE, 
    'POST', 
    {
      username: userCredential.username,
      password: userCredential.password
    }, 
    token
  );
};

export const getAllAccounts = async (token: string): Promise<Account[]> => {
  const response = await apiRequest<{ success: boolean; accounts?: Account[]; message?: string }>(
    API_ROUTES.ACCOUNTS.ALL, 
    'GET', 
    null, 
    token
  );
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to fetch accounts');
  }
  
  return response.accounts || [];
};

export const deleteAccount = async (id: string, token: string): Promise<boolean> => {
  const response = await apiRequest<{ success: boolean }>(
    API_ROUTES.ACCOUNTS.DELETE(id), 
    'DELETE', 
    null, 
    token
  );
  return response.success;
};