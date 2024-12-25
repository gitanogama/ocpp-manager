import { hc } from 'hono/client';
import type { AppType } from './types';

const client = hc<AppType>('http://localhost:4000/').api;
