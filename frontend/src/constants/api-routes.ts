export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_ROUTES = {
  IPCAM: `${BASE_API_URL}/capture`,
  UPLOAD: `${BASE_API_URL}/upload`,
  HEALTH_CHECK: `${BASE_API_URL}/`,
  CAMERAS: {
    ALL: `${BASE_API_URL}/cameras`,
    BY_LOCATION: (location: string) => `${BASE_API_URL}/cameras/location/${location}`,
  },
  CAMERA: {
    POST: `${BASE_API_URL}/camera`,
    BY_ID: (id: string) => `${BASE_API_URL}/camera/${id}`,
    CAPTURE: (id: string) => `${BASE_API_URL}/camera/${id}/capture`,
  },
  IMAGES: {
    ALL: `${BASE_API_URL}/images`,
  },
  AUTH: {
    LOGIN: `${BASE_API_URL}/auth/login`,
    LOGOUT: `${BASE_API_URL}/auth/logout`,
    REFRESH: `${BASE_API_URL}/auth/refresh`,
    VALIDATE: `${BASE_API_URL}/auth/validate`,
  },
  ACCOUNTS: {
    ALL: `${BASE_API_URL}/accounts`,
    BY_ID: (id: string) => `${BASE_API_URL}/account/${id}`,
    CREATE: `${BASE_API_URL}/account/new`,
    DELETE: (id: string) => `${BASE_API_URL}/account/${id}`,
  },
  CREDENTIALS: {
    ALL: `${BASE_API_URL}/credentials`,
    BY_ID: (id: string) => `${BASE_API_URL}/credential/${id}`,
    CREATE: `${BASE_API_URL}/credential/new`,}
};
