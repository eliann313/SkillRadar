import crypto from "crypto";

// Clave secreta de encriptación derivada
const getEncryptionKey = (): Buffer => {
  const secret =
    process.env.ENCRYPTION_KEY ||
    process.env.AUTH_SECRET ||
    "skillradar-fallback-development-secret-key-32";
  // Generar un hash SHA-256 del secreto para obtener exactamente 32 bytes (256 bits)
  return crypto.createHash("sha256").update(secret).digest();
};

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard para GCM

/**
 * Encripta un texto plano a una cadena en formato hexadecimal que incluye IV, Ciphertext y Auth Tag.
 * Formato: ivHex:authTagHex:encryptedTextHex
 */
export function encrypt(text: string): string {
  if (!text) return "";

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

/**
 * Desencripta una cadena formateada (ivHex:authTagHex:encryptedTextHex) de vuelta a texto plano.
 */
export function decrypt(encryptedText: string | null | undefined): string {
  if (!encryptedText) return "";

  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      throw new Error("Formato de texto cifrado inválido.");
    }

    const [ivHex, tagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("❌ [Crypto] Error desencriptando API Key:", error);
    return "";
  }
}
