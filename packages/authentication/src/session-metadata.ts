import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

export interface SessionMetadata {
  region: string | null;
  userAgent: string | null;
}

const ALGORITHM = "aes-256-gcm";
const VERSION = "v1";
const MAX_REGION_LENGTH = 160;
const MAX_USER_AGENT_LENGTH = 1024;

const normalizeHeader = (value: string | null, maxLength: number) => {
  const normalized = Array.from(value ?? "", (character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint < 32 || codePoint === 127 ? " " : character;
  })
    .join("")
    .trim();
  return normalized ? normalized.slice(0, maxLength) : null;
};

const decodeHeader = (value: string | null) => {
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const getEncryptionKey = () => {
  const keyMaterial =
    process.env.SESSION_METADATA_ENCRYPTION_KEY?.trim() ||
    process.env.DATABASE_URL?.trim();

  return keyMaterial ? createHash("sha256").update(keyMaterial).digest() : null;
};

const getRegion = (headers: Headers) => {
  const city = normalizeHeader(
    decodeHeader(headers.get("x-vercel-ip-city")),
    MAX_REGION_LENGTH
  );
  const region = normalizeHeader(
    headers.get("x-vercel-ip-country-region") ||
      headers.get("cloudfront-viewer-country-region") ||
      headers.get("cf-region-code"),
    MAX_REGION_LENGTH
  );
  const country = normalizeHeader(
    headers.get("x-vercel-ip-country") ||
      headers.get("cloudfront-viewer-country") ||
      headers.get("cf-ipcountry"),
    MAX_REGION_LENGTH
  );

  return [city, region, country].filter(Boolean).join(", ") || null;
};

export const hashSessionToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const encryptSessionMetadata = (headers: Headers) => {
  const key = getEncryptionKey();

  if (!key) {
    return null;
  }

  const metadata: SessionMetadata = {
    region: getRegion(headers),
    userAgent: normalizeHeader(
      headers.get("user-agent"),
      MAX_USER_AGENT_LENGTH
    ),
  };
  const initializationVector = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, initializationVector);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(metadata), "utf8"),
    cipher.final(),
  ]);

  return [
    VERSION,
    initializationVector.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
};

export const decryptSessionMetadata = (
  encryptedMetadata: string | null
): SessionMetadata | null => {
  const key = getEncryptionKey();

  if (!(key && encryptedMetadata)) {
    return null;
  }

  try {
    const [version, initializationVector, authTag, encrypted] =
      encryptedMetadata.split(".");

    if (
      !(version === VERSION && initializationVector && authTag && encrypted)
    ) {
      return null;
    }

    const decipher = createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(initializationVector, "base64url")
    );
    decipher.setAuthTag(Buffer.from(authTag, "base64url"));
    const value = JSON.parse(
      Buffer.concat([
        decipher.update(Buffer.from(encrypted, "base64url")),
        decipher.final(),
      ]).toString("utf8")
    ) as Partial<SessionMetadata>;

    return {
      region: typeof value.region === "string" ? value.region : null,
      userAgent: typeof value.userAgent === "string" ? value.userAgent : null,
    };
  } catch {
    return null;
  }
};
