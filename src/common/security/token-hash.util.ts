import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const ITERATIONS = 120_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export function hashToken(token: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(token, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString(
    'hex',
  );

  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`;
}

export function verifyToken(token: string, storedHash: string): boolean {
  const [algorithm, iterationsRaw, salt, hash] = storedHash.split('$');

  if (algorithm !== 'pbkdf2' || !iterationsRaw || !salt || !hash) {
    return false;
  }

  const iterations = Number(iterationsRaw);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }

  const actualHash = pbkdf2Sync(token, salt, iterations, KEY_LENGTH, DIGEST);
  const expectedHash = Buffer.from(hash, 'hex');

  if (actualHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(actualHash, expectedHash);
}
