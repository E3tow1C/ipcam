export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_ROUTES = {
  IPCAM: {
    GET: `${BASE_API_URL}/ipcam`,
    POST: `${BASE_API_URL}/ipcam`,
  },
  HEALTH_CHECK: `${BASE_API_URL}/`,
};
