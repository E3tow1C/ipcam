export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;
export const SERVER_SIDE_URL = process.env.SERVER_SIDE_URL;

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
    BY_ID: (id: string) => `${BASE_API_URL}/delete/${id}`,
    FILTER: (source: string, fromDate: string, toDate: string) => `${BASE_API_URL}/images/filter?source=${source}&from_date=${fromDate}&to_date=${toDate}`,
  },
  AUTH: {
    LOGIN: `${BASE_API_URL}/auth/login`,
    LOGOUT: `${BASE_API_URL}/auth/logout`,
    REFRESH: `${SERVER_SIDE_URL}/auth/refresh`,
    VALIDATE: `${SERVER_SIDE_URL}/auth/validate`,
  },
  ACCOUNTS: {
    ALL: `${BASE_API_URL}/accounts`,
    BY_ID: (id: string) => `${BASE_API_URL}/account/${id}`,
    CREATE: `${SERVER_SIDE_URL}/account/new`,
    DELETE: (id: string) => `${BASE_API_URL}/account/${id}`,
  },
  CREDENTIALS: {
    ALL: `${BASE_API_URL}/credentials`,
    BY_ID: (id: string) => `${BASE_API_URL}/credential/${id}`,
    CREATE: `${BASE_API_URL}/credential/new`
  },
  DASHBOARD: {
    ALL: `${BASE_API_URL}/dashboard`
  }
};
