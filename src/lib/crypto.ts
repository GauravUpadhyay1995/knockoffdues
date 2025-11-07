import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_KEY || "local-secret-key";

/**
 * Encrypts a JavaScript object into an AES-encrypted string.
 */
export function encrypt<T>(data: T): string {
  const jsonData = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonData, SECRET_KEY).toString();
}

/**
 * Decrypts an AES-encrypted string back into a JavaScript object.
 */
export function decrypt<T>(ciphertext: string): T {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted) as T;
}
