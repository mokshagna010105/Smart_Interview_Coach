/**
 * Clean application logger utility
 */
const timestamp = () => new Date().toISOString();

export const logger = {
  info: (message, meta = '') => {
    console.log(`[${timestamp()}] [INFO] ${message}`, meta ? meta : '');
  },
  warn: (message, meta = '') => {
    console.warn(`[${timestamp()}] [WARN] ${message}`, meta ? meta : '');
  },
  error: (message, error = '') => {
    console.error(`[${timestamp()}] [ERROR] ${message}`, error ? error : '');
  },
  debug: (message, meta = '') => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${timestamp()}] [DEBUG] ${message}`, meta ? meta : '');
    }
  }
};
