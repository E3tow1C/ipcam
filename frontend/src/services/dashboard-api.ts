import { API_ROUTES } from '@/constants/api-routes';
import { apiRequest } from '@/utils/api-helpers';

export type MetricData = {
  // Define the structure based on your dashboard data
  [key: string]: unknown;
};

export const getDashboardData = async (): Promise<MetricData> => {
  return await apiRequest<MetricData>(API_ROUTES.DASHBOARD.ALL, 'GET');
};