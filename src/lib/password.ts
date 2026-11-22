import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;
export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 72; // bcrypt only reads the first 72 bytes

// No look-alike characters (0/O, 1/l/I) so a temporary password can be read out or typed without mistakes.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** A random temporary password, shown once to the admin who creates the account. */
export function generateTempPassword(length = 14): string {
  // Web Crypto, so this file also loads in the edge runtime that the sign-in middleware uses.
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
}

/** A hash for an account that does not exist, so a login for an unknown email takes as long as a real one. */
export const DUMMY_HASH = "$2b$12$25RYTCREUciDHWoH2f78NuMdaEa8RNWuRNDysvuy.Yaj2MUl1dBZ."; // precomputed (cost 12), so loading this file stays fast

const COMMON = new Set(["password", "password1", "password123", "123456789", "1234567890", "qwerty123", "admin12345", "hospital123", "niramaya123", "welcome123"]);

/** Returns a message when the password is not acceptable, or null when it is. */
export function passwordProblem(password: string, email?: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (password.length > MAX_PASSWORD_LENGTH) return `Use at most ${MAX_PASSWORD_LENGTH} characters.`;
  if (COMMON.has(password.toLowerCase())) return "That password is too common. Choose another.";
  if (email && password.toLowerCase().includes(email.split("@")[0].toLowerCase()) && email.split("@")[0].length >= 4) {
    return "The password must not contain your email name.";
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return "Use both letters and numbers.";
  return null;
}
