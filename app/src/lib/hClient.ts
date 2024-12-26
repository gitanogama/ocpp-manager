import { hc } from 'hono/client';
import type { AppType } from './types';

export const hClient = hc<AppType>('http://192.168.10.154:3000').api;
