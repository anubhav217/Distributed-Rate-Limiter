// src/config/env.ts
import 'dotenv/config';

export type StoreBackend = 'memory' | 'redis';

export interface AppConfig {
  port: number;
  storeBackend: StoreBackend;
  redisUrl: string;
}

const getEnv = (key: string, defaultValue?: string): string | undefined => {
  const value = process.env[key];
  return value ?? defaultValue;
};

const parsePort = (value: string | undefined, fallback: number): number => {
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const config: AppConfig = {
  port: parsePort(process.env.PORT, 3000),
  storeBackend: (getEnv('STORE_BACKEND', 'memory') as StoreBackend) || 'memory',
  redisUrl: getEnv('REDIS_URL', 'redis://localhost:6379')!,
};
