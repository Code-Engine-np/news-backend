/**
 * Seed script: creates the standard nav categories in the database.
 * Run once with:  node scripts/seed-categories.mjs
 *
 * Requires the backend dev server to be running on localhost:3001.
 * Uses SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from the backend .env.
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, "../.env");

// Parse .env manually (no dotenv dep needed)
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const BASE = `http://localhost:${env.PORT ?? 3001}/api`;
const EMAIL = env.SEED_ADMIN_EMAIL;
const PASSWORD = env.SEED_ADMIN_PASSWORD;

/** Categories from MAIN_NAV_ITEMS + FOOTER_LINK_GROUPS in site.ts */
const CATEGORIES = [
  { slug: "current-affairs", name: "समसामयिक" },
  { slug: "society", name: "समाज" },
  { slug: "economy", name: "अर्थ/विकास" },
  { slug: "features", name: "विशेष" },
  { slug: "opinion", name: "दृष्टिकोण" },
  { slug: "arts", name: "कला" },
  { slug: "sports", name: "खेलकुद" },
  { slug: "politics", name: "राजनीति" },
  { slug: "business", name: "व्यापार" },
];

async function main() {
  // 1. Login
  console.log(`Logging in as ${EMAIL}…`);
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!loginRes.ok) {
    console.error("Login failed:", await loginRes.text());
    process.exit(1);
  }
  const { AuthTokens } = await loginRes.json();
  const token = AuthTokens.accessToken;
  console.log("Logged in.\n");

  // 2. Create each category (skip if slug already exists = 409)
  for (const cat of CATEGORIES) {
    const res = await fetch(`${BASE}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ slug: cat.slug, name: cat.name }),
    });

    if (res.status === 409) {
      console.log(`  SKIP  ${cat.slug} (already exists)`);
    } else if (res.ok) {
      console.log(`  CREATE ${cat.slug} → "${cat.name}"`);
    } else {
      console.error(`  ERROR  ${cat.slug}:`, await res.text());
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
