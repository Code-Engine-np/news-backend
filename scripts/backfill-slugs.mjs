/**
 * Dry-run backfill script: regenerates romanized Latin-script slugs for all
 * articles that currently have Nepali (Devanagari) or percent-encoded slugs.
 *
 * Usage:
 *   node scripts/backfill-slugs.mjs            # dry-run (default) — logs changes, writes nothing
 *   node scripts/backfill-slugs.mjs --apply    # actually writes to the DB
 *
 * Requires the backend dev server to be running on localhost:3001.
 * Uses SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from the backend .env for auth.
 *
 * IMPORTANT: Do NOT run with --apply in production without reviewing the dry-run
 * output first, confirming all old URLs will be redirected, and getting explicit
 * sign-off. SEO redirects (301s from old Nepali slugs to new romanized slugs)
 * are NOT implemented yet — do that first if canonical URLs matter for search.
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, "../.env");

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    }),
);

const BASE_URL = "http://localhost:3001/api";
const APPLY = process.argv.includes("--apply");

// ─── Transliteration logic (mirrored from slug.service.ts) ─────────────────

const DEVANAGARI_MAP = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ii',
  'उ': 'u', 'ऊ': 'uu', 'ऋ': 'ri', 'ॠ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u',
  'ू': 'u', 'ृ': 'ri', 'े': 'e', 'ै': 'ai',
  'ो': 'o', 'ौ': 'au',
  'ं': 'n', 'ँ': 'n', 'ः': 'h',
  '्': '',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'w',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'ळ': 'l', 'ऱ': 'r', 'ऩ': 'n',
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  'ॐ': 'om',
};

const CONSONANT_RANGE = new Set(
  Object.keys(DEVANAGARI_MAP).filter((k) => {
    const code = k.codePointAt(0) ?? 0;
    return (code >= 0x0915 && code <= 0x0939) || [0x0933, 0x0931, 0x0928].includes(code);
  }),
);
const MATRAS = new Set(['ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै', 'ो', 'ौ', 'ं', 'ँ', 'ः']);
const HALANT = '्';

function transliterateNepali(text) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1] ?? '';
    const mapped = DEVANAGARI_MAP[ch];
    if (mapped !== undefined) {
      result += mapped;
      if (CONSONANT_RANGE.has(ch) && !MATRAS.has(next) && next !== HALANT) {
        result += 'a';
      }
    } else {
      result += ch;
    }
  }
  return result;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'article';
}

function generateCandidateSlug(title) {
  return slugify(transliterateNepali(title));
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function hasDevanagari(str) {
  return /[ऀ-ॿ]/.test(str);
}

function isPercentEncoded(str) {
  return /%[0-9A-Fa-f]{2}/.test(str);
}

function needsBackfill(slug) {
  return hasDevanagari(slug) || isPercentEncoded(slug);
}

async function fetchJson(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) throw new Error(`${options.method ?? "GET"} ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔍  Slug backfill — ${APPLY ? "⚠️  APPLY MODE (will write to DB)" : "DRY-RUN (read-only)"}\n`);

  // 1. Authenticate
  const { access_token } = await fetchJson("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: env.SEED_ADMIN_EMAIL,
      password: env.SEED_ADMIN_PASSWORD,
    }),
  });
  console.log("✅  Authenticated\n");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${access_token}`,
  };

  // 2. Fetch all articles (no pagination — admin endpoint)
  const articles = await fetchJson("/articles", { headers: authHeaders });
  const list = Array.isArray(articles) ? articles : articles.data ?? [];
  console.log(`📰  Total articles fetched: ${list.length}\n`);

  // 3. Filter articles that need backfill
  const toBackfill = list.filter((a) => needsBackfill(a.slug));
  console.log(`🔄  Articles needing romanized slug: ${toBackfill.length}\n`);

  if (toBackfill.length === 0) {
    console.log("✅  Nothing to backfill. All slugs are already romanized.");
    return;
  }

  // 4. Build a set of all existing slugs (for uniqueness check)
  const existingSlugs = new Set(list.map((a) => a.slug));

  // 5. Process each article
  const results = [];
  for (const article of toBackfill) {
    let candidate = generateCandidateSlug(article.title);
    // Uniqueness: skip the article's own id (it will be replaced)
    let counter = 1;
    const base = candidate;
    while (existingSlugs.has(candidate) && candidate !== article.slug) {
      counter++;
      candidate = `${base}-${counter}`;
    }

    const entry = {
      id: article.id,
      title: article.title,
      oldSlug: article.slug,
      newSlug: candidate,
    };
    results.push(entry);

    // Reserve the new slug so subsequent iterations don't collide
    existingSlugs.delete(article.slug);
    existingSlugs.add(candidate);
  }

  // 6. Print mapping table
  console.log("Slug mapping:\n");
  console.log("  ID                                   | Old slug                              | New slug");
  console.log("  " + "-".repeat(110));
  for (const r of results) {
    const oldTrunc = r.oldSlug.slice(0, 37).padEnd(37);
    const newTrunc = r.newSlug.slice(0, 50);
    console.log(`  ${r.id} | ${oldTrunc} | ${newTrunc}`);
  }
  console.log();

  // 7. Apply (if --apply flag given)
  if (!APPLY) {
    console.log("ℹ️   Dry-run complete. Re-run with --apply to write these changes.\n");
    console.log("⚠️   REMINDER: Implement 301 redirects from old slugs to new slugs before");
    console.log("    running --apply, or existing bookmarks/search-index links will break.\n");
    return;
  }

  let success = 0;
  let failed = 0;
  for (const r of results) {
    try {
      await fetchJson(`/articles/${r.id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ slug: r.newSlug }),
      });
      console.log(`✅  ${r.id}: ${r.oldSlug} → ${r.newSlug}`);
      success++;
    } catch (err) {
      console.error(`❌  ${r.id}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. ${success} updated, ${failed} failed.\n`);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
