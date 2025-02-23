export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_ROUTES = {
  IPCAM: `${BASE_API_URL}/capture`,
  UPLOAD: `${BASE_API_URL}/upload`,
  HEALTH_CHECK: `${BASE_API_URL}/`,
};
