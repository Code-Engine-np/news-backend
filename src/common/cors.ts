import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * CORS options shared by the local (`main.ts`) and serverless (`serverless.ts`)
 * bootstraps so both behave identically.
 *
 * Why a function origin instead of a static array: the public site is
 * server-rendered, so those requests never hit CORS — but the admin panel
 * fetches its lists from the browser, so those DO. To keep the admin working
 * across environments we allow:
 *   - requests with no `Origin` (curl, server-to-server, same-origin SSR),
 *   - any origin listed in the `CORS_ORIGIN` env (comma-separated, trimmed),
 *   - any of the frontend's Vercel deployments (preview + production),
 *   - everything, when `CORS_ORIGIN` is unset (dev convenience).
 */
export function buildCorsOptions(): CorsOptions {
  const allowlist = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const isVercelDeployment = (origin: string) =>
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

  return {
    origin: (origin, callback) => {
      if (
        !origin ||
        allowlist.length === 0 ||
        allowlist.includes(origin) ||
        isVercelDeployment(origin)
      ) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    exposedHeaders: ['X-New-Access-Token', 'X-New-Refresh-Token'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  };
}
