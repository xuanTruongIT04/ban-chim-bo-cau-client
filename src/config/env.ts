export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  isDev: import.meta.env.DEV as boolean,
  isProd: import.meta.env.PROD as boolean,
} as const;
