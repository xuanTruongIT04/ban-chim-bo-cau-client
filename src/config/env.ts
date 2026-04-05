export const env = {
  appEnv: import.meta.env.APP_ENV as string,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  isDev: import.meta.env.DEV as boolean,
  isProd: import.meta.env.PROD as boolean,
} as const;
