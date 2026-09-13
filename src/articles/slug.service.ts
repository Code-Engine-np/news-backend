import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import slugLib from 'slug';
import { Article } from '@/entities/article.entity';

// Library evaluation:
//   - @indic-transliteration/sanscript: produces IAST/ITRANS with diacritics
//     (ā, ṭ) or uppercase — not URL-safe without extra post-processing.
//   - indic-transliterate: general-purpose, Nepali-specific quality untested,
//     also outputs diacritics by default.
//   - slug (npm, already installed): its built-in Devanagari map produces
//     unusable output for Nepali (e.g. "बाढी" → "bdha").
//   Choice: custom Devanagari → Latin phonetic map modelled on the
//   romanization style used by OnlineKhabar and Setopati, followed by the
//   `slug` package for URL cleanup (lowercase, strip specials, collapse hyphens).
//   This requires no extra dependency and gives us full control over the output.

const DEVANAGARI_MAP: Record<string, string> = {
  // Independent vowels
  अ: 'a',
  आ: 'aa',
  इ: 'i',
  ई: 'ii',
  उ: 'u',
  ऊ: 'uu',
  ऋ: 'ri',
  ॠ: 'ri',
  ए: 'e',
  ऐ: 'ai',
  ओ: 'o',
  औ: 'au',
  // Vowel signs (matras) — long vowels simplified to short for URL friendliness
  'ा': 'a',
  'ि': 'i',
  'ी': 'i',
  'ु': 'u',
  'ू': 'u',
  'ृ': 'ri',
  'े': 'e',
  'ै': 'ai',
  'ो': 'o',
  'ौ': 'au',
  // Nasalisation / anusvara / chandrabindu / visarga
  'ं': 'n',
  'ँ': 'n',
  'ः': 'h',
  // Virama (halant) — suppresses the inherent 'a' of the preceding consonant
  '्': '',
  // Consonants — ka-varga
  क: 'k',
  ख: 'kh',
  ग: 'g',
  घ: 'gh',
  ङ: 'ng',
  // ca-varga
  च: 'ch',
  छ: 'chh',
  ज: 'j',
  झ: 'jh',
  ञ: 'ny',
  // ṭa-varga (retroflex)
  ट: 't',
  ठ: 'th',
  ड: 'd',
  ढ: 'dh',
  ण: 'n',
  // ta-varga (dental)
  त: 't',
  थ: 'th',
  द: 'd',
  ध: 'dh',
  न: 'n',
  // pa-varga
  प: 'p',
  फ: 'ph',
  ब: 'b',
  भ: 'bh',
  म: 'm',
  // semi-vowels / fricatives / sibilants / aspirate
  य: 'y',
  र: 'r',
  ल: 'l',
  व: 'w',
  श: 'sh',
  ष: 'sh',
  स: 's',
  ह: 'h',
  // additional consonants
  ळ: 'l',
  ऱ: 'r',
  ऩ: 'n',
  // Nepali / Devanagari digits → ASCII digits
  '०': '0',
  '१': '1',
  '२': '2',
  '३': '3',
  '४': '4',
  '५': '5',
  '६': '6',
  '७': '7',
  '८': '8',
  '९': '9',
  // Miscellaneous
  ॐ: 'om',
};

const CONSONANTS = new Set(
  Object.keys(DEVANAGARI_MAP).filter((k) => {
    const v = DEVANAGARI_MAP[k];
    // A key is a consonant if it maps to a non-empty string AND is not a
    // vowel/matra/digit/special — simplest check: it's a standalone letter
    // in the Devanagari consonant range U+0915–U+0939 and a few extras
    const code = k.codePointAt(0) ?? 0;
    return (
      (code >= 0x0915 && code <= 0x0939) ||
      [0x0933, 0x0931, 0x0928].includes(code)
    );
  }),
);

const MATRAS = new Set([
  'ा',
  'ि',
  'ी',
  'ु',
  'ू',
  'ृ',
  'े',
  'ै',
  'ो',
  'ौ',
  'ं',
  'ँ',
  'ः',
]);
const HALANT = '्';

/**
 * Phonetically transliterates a Nepali Devanagari string to Latin script.
 * Consonants receive an inherent 'a' vowel unless immediately followed by
 * a vowel sign (matra) or halant (virama), matching standard Devanagari
 * syllable structure.
 */
export function transliterateNepali(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1] ?? '';
    const mapped = DEVANAGARI_MAP[ch];

    if (mapped !== undefined) {
      result += mapped;
      // Add inherent 'a' after consonants not followed by a matra or halant
      if (CONSONANTS.has(ch) && !MATRAS.has(next) && next !== HALANT) {
        result += 'a';
      }
    } else {
      // Pass through ASCII, spaces, punctuation — slug will clean them up
      result += ch;
    }
  }
  return result;
}

@Injectable()
export class SlugService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepo: Repository<Article>,
  ) {}

  /**
   * Generates a unique URL-safe romanized slug from a (Nepali) article title.
   * Steps: transliterate Devanagari → Latin → slugify → uniqueness check.
   *
   * @param title     The article title (may be Nepali or English).
   * @param excludeId Article UUID to exclude from the uniqueness check (for
   *                  updates — skip the article being edited).
   */
  async generateSlug(title: string, excludeId?: string): Promise<string> {
    const transliterated = transliterateNepali(title);
    const base =
      slugLib(transliterated, { lower: true, mode: 'rfc3986', trim: true }) ||
      'article';

    let candidate = base;
    let counter = 1;
    for (;;) {
      const where = excludeId
        ? { slug: candidate, id: Not(excludeId) }
        : { slug: candidate };
      const existing = await this.articlesRepo.findOne({
        where,
        select: { id: true },
      });
      if (!existing) break;
      counter++;
      candidate = `${base}-${counter}`;
    }
    return candidate;
  }

  /**
   * Sanitises a manually entered slug: lowercases, strips non-alphanumeric,
   * collapses/trims hyphens.  Returns the cleaned slug.
   */
  sanitiseManualSlug(raw: string): string {
    return slugLib(raw, { lower: true, mode: 'rfc3986', trim: true }) || '';
  }

  /**
   * Ensures a manually provided slug is unique in the articles table.
   * Appends -2, -3, … until unique.
   */
  async ensureUnique(base: string, excludeId?: string): Promise<string> {
    let candidate = base;
    let counter = 1;
    for (;;) {
      const where = excludeId
        ? { slug: candidate, id: Not(excludeId) }
        : { slug: candidate };
      const existing = await this.articlesRepo.findOne({
        where,
        select: { id: true },
      });
      if (!existing) break;
      counter++;
      candidate = `${base}-${counter}`;
    }
    return candidate;
  }
}
