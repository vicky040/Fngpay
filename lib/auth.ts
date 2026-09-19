import bcrypt from "bcryptjs";

const HASH_ROUNDS = 10;

export function hashSecret(plain: string): Promise<string> {
  return bcrypt.hash(plain, HASH_ROUNDS);
}

export function verifySecret(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
