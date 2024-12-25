import { hc } from 'hono/client';
import type { AppType } from './types';

export const hClient = hc<AppType>('http://localhost:3000').api;
