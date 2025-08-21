import { API_ROUTES } from '@/constants/api-routes';
import { apiRequest, getAccessToken } from '@/utils/api-helpers';

export type Credential = {
  _id: string;
  name: string;
  host: string;
  expire: Date;
  secret: string;
};

export const getAllCredentials = async (token: string): Promise<Credential[]> => {
  const response = await apiRequest<{ credentials: Credential[] }>(
    API_ROUTES.CREDENTIALS.ALL, 
    'GET', 
    null, 
    token
  );
  return response.credentials;
};

export const createNewCredential = async (
  name: string, 
  host: string, 
  expire?: Date
): Promise<boolean> => {
  const token = getAccessToken();
  const response = await apiRequest<{ success: boolean }>(
    API_ROUTES.CREDENTIALS.CREATE, 
    'POST', 
    { name, host, expire }, 
    token
  );
  return response.success;
};

export const deleteCredential = async (id: string, token: string): Promise<boolean> => {
  const response = await apiRequest<{ success: boolean }>(
    API_ROUTES.CREDENTIALS.BY_ID(id), 
    'DELETE', 
    null, 
    token
  );
  return response.success;
};