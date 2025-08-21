// Re-export all API functions for backward compatibility
export * from './auth-api';
export * from './camera-api';
export * from './credential-api';
export * from './dashboard-api';
export * from './image-api';

// Note: The original apis.ts is kept for backward compatibility
// but some functions may have conflicts with the new modular structure
// Import directly from specific modules for new code