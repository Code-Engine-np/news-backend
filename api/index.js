// Vercel serverless entry.
//
// The real bootstrap lives in `src/serverless.ts` and is compiled (with all
// `@/` path aliases resolved by tsc-alias) to `dist/serverless.js` by the
// `buildCommand` (`pnpm run build`) that Vercel runs before packaging this
// function. We only re-export the compiled handler here so Vercel's bundler
// traces `dist/` and includes it in the deployment.
module.exports = require('../dist/serverless').default;
