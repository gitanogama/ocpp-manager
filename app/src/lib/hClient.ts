import { hc } from 'hono/client';
import type { AppType } from './types';
import { dev } from '$app/environment';
import { PUBLIC_DEV_BACKEND_URL } from '$env/static/public';

export const hClient = hc<AppType>(dev ? PUBLIC_DEV_BACKEND_URL : '/').api;
