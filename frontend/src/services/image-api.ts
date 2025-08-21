import { API_ROUTES } from '@/constants/api-routes';
import { apiRequest, getAccessToken } from '@/utils/api-helpers';

export type ImageDataProb = {
  id: string;
  timestamp: string;
  type: string;
  image_url: string;
  camera_id: string;
};

export const uploadImage = async (image: File) => {
  const formData = new FormData();
  formData.append('file', image);
  return await apiRequest(API_ROUTES.UPLOAD, 'POST', formData);
};

export const captureImage = async (): Promise<string> => {
  const response = await apiRequest<{ image_url: string }>(API_ROUTES.IPCAM, 'GET');
  return response.image_url;
};

export const getAllImages = async (): Promise<string[]> => {
  const response = await apiRequest<{ all_image_urls: string[] }>(API_ROUTES.IMAGES.ALL, 'GET');
  return response.all_image_urls;
};

export const getFilteredImages = async (
  source: string, 
  fromDate: string, 
  toDate: string
): Promise<ImageDataProb[]> => {
  const response = await apiRequest<{ images: ImageDataProb[] }>(
    API_ROUTES.IMAGES.FILTER(source, fromDate, toDate), 
    'GET'
  );
  return response.images;
};

export const deleteImage = async (id: string): Promise<boolean> => {
  const accessToken = getAccessToken();
  const response = await apiRequest<{ status: string }>(
    API_ROUTES.IMAGES.BY_ID(id), 
    'DELETE', 
    null, 
    accessToken
  );
  return response.status === 'completed';
};