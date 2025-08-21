// Re-export all API functions for backward compatibility
export * from './auth-api';
export * from './camera-api';
export * from './credential-api';
export * from './dashboard-api';
export * from './image-api';

// Keep the original apis.ts for now, but mark as deprecated
export * from './apis';