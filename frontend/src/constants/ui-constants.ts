// Animation constants
export const ANIMATION_DURATION = 300; // milliseconds
export const ANIMATION_EASING = 'ease-in-out';

// UI Constants
export const SIDEBAR_WIDTH = 300;
export const SIDEBAR_MOBILE_MAX_WIDTH = 400;
export const MODAL_TIMEOUT = 300;

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Common class patterns
export const COMMON_STYLES = {
  button: {
    primary: "bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all",
    secondary: "bg-gray-200 text-gray-500 px-4 py-2 rounded-md hover:bg-gray-300 transition-all",
    danger: "bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-all",
  },
  input: {
    base: "border w-full appearance-none border-gray-300 rounded-md px-2 py-2 cursor-pointer hover:bg-gray-50 transition-all focus:outline-none",
  },
  card: {
    base: "bg-gray-50 border rounded-xl hover:bg-gray-100 transition-all p-4",
  }
} as const;

// Date formatting
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

// API error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong',
  NETWORK: 'Network error occurred',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'Resource not found',
} as const;