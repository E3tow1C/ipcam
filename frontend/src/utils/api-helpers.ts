import Cookies from 'js-cookie';
import { ERROR_MESSAGES } from '@/constants/ui-constants';

// Token management utilities
export const getAccessToken = (): string | null => {
  return Cookies.get('access_token') || null;
};

export const getAuthHeaders = (token?: string | null): Record<string, string> => {
  const headers: Record<string, string> = {};
  const authToken = token || getAccessToken();
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

// API error handling utilities
export class APIError extends Error {
  public status: number;
  public data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

export const handleAPIError = (error: unknown): never => {
  if (error instanceof APIError) {
    throw error;
  }
  
  if (error instanceof Error) {
    throw new APIError(`API request failed: ${error.message}`, 500);
  }
  
  throw new APIError(ERROR_MESSAGES.GENERIC, 500);
};

// Common fetch wrapper
type RequestBody = Record<string, unknown> | FormData | null;

export const apiRequest = async <T>(
  url: string,
  method: string,
  body: RequestBody = null,
  token?: string | null
): Promise<T> => {
  try {
    const headers: Record<string, string> = {
      ...getAuthHeaders(token),
    };

    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : null,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data?.error || data?.detail || ERROR_MESSAGES.GENERIC,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    return handleAPIError(error);
  }
};

// Date utilities
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(undefined, options);
};

export const getTomorrowISO = (): string => {
  return new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
};