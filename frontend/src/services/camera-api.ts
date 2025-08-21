import { API_ROUTES } from '@/constants/api-routes';
import { apiRequest, getAccessToken } from '@/utils/api-helpers';

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
  const response = await apiRequest<{ cameras: CameraData[] }>(API_ROUTES.CAMERAS.ALL, 'GET');
  return response.cameras;
};

export const getCamerasByLocation = async (location: string): Promise<CameraData[]> => {
  const response = await apiRequest<{ cameras: CameraData[] }>(API_ROUTES.CAMERAS.BY_LOCATION(location), 'GET');
  return response.cameras;
};

export const getCameraById = async (id: string): Promise<CameraData> => {
  const response = await apiRequest<{ camera: CameraData }>(API_ROUTES.CAMERA.BY_ID(id), 'GET');
  return response.camera;
};

export const addCamera = async (
  name: string, 
  url: string, 
  location: string, 
  username?: string, 
  password?: string, 
  authType?: string
): Promise<CameraData> => {
  const accessToken = getAccessToken();
  const response = await apiRequest<{ camera: CameraData }>(
    API_ROUTES.CAMERA.POST, 
    'POST', 
    { name, url, location, username, password, authType }, 
    accessToken
  );
  return response.camera;
};

export const updateCamera = async (
  id: string, 
  name: string, 
  url: string, 
  location: string, 
  username?: string, 
  password?: string, 
  authType?: string
): Promise<boolean> => {
  const accessToken = getAccessToken();
  const response = await apiRequest<{ success: boolean }>(
    API_ROUTES.CAMERA.BY_ID(id), 
    'PATCH', 
    { name, url, location, username, password, authType }, 
    accessToken
  );
  return response.success;
};

export const deleteCamera = async (id: string): Promise<boolean> => {
  const accessToken = getAccessToken();
  const response = await apiRequest<{ status: string }>(
    API_ROUTES.CAMERA.BY_ID(id), 
    'DELETE', 
    null, 
    accessToken
  );
  return response.status === 'completed';
};

export const captureCameraImage = async (id: string): Promise<string> => {
  const response = await apiRequest<{ image_url: string }>(API_ROUTES.CAMERA.CAPTURE(id), 'GET');
  return response.image_url;
};