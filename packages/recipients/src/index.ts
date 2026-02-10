import { RedisClient } from "bun";
export interface ParsedAddress {
  original: string;

  local: string; // foo+bar
  domain: string; // example.com

  baseLocal: string; // foo
  tag?: string; // bar

  normalizedLocal: string;
  normalizedAddress: string;
}

export interface DomainFeatures {
  plusTagging: boolean;
  dotAliasing: boolean;
  lowercase: boolean;
}

export abstract class Recipients {
  static redis = new RedisClient(
    process.env.REDIS_URL || "redis://localhost:6379"
  );

  static parseEmailAddress(input: string): {
    local: string;
    domain: string;
  } {
    const trimmed = input.trim();

    const atIndex = trimmed.lastIndexOf("@");
    if (atIndex === -1) {
      throw new Error("Invalid email address: missing @");
    }

    const local = trimmed.slice(0, atIndex);
    const domain = trimmed.slice(atIndex + 1);

    if (!(local && domain)) {
      throw new Error("Invalid email address");
    }

    return { local, domain };
  }

  static normalizeEmailAddress(
    input: string,
    features: DomainFeatures
  ): ParsedAddress {
    const { local, domain } = Recipients.parseEmailAddress(input);

    let workingLocal = local;
    let workingDomain = domain;

    if (features.lowercase) {
      workingLocal = workingLocal.toLowerCase();
      workingDomain = workingDomain.toLowerCase();
    }

    let baseLocal = workingLocal;
    let tag: string | undefined;

    // Plus-Tagging
    if (features.plusTagging) {
      const plusIndex = workingLocal.indexOf("+");
      if (plusIndex !== -1) {
        baseLocal = workingLocal.slice(0, plusIndex);
        tag = workingLocal.slice(plusIndex + 1) || undefined;
      }
    }

    // Dot-Aliasing (Gmail-style)
    if (features.dotAliasing) {
      baseLocal = baseLocal.replace(/\./g, "");
    }

    const normalizedLocal = baseLocal;
    const normalizedAddress = `${normalizedLocal}@${workingDomain}`;

    return {
      original: input,

      local,
      domain,

      baseLocal,
      tag,

      normalizedLocal,
      normalizedAddress,
    };
  }

  static async resolveRecipient(
    domain: string,
    local: string
  ): Promise<{ type: string; target: string } | null> {
    // check exact mailbox
    if (await Recipients.redis.sismember(`mailbox:${domain}`, local)) {
      return { type: "mailbox", target: local };
    }

    // Check for possible wildcard matches
    const wildcards = await Recipients.redis.smembers(`wildcard:${domain}`); // for example ["support-*", "info-*"]
    for (const pattern of wildcards) {
      const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
      if (regex.test(local)) {
        return { type: "wildcard", target: pattern };
      }
    }

    // Last check: check for catch-all
    if (await Recipients.redis.exists(`catchall:${domain}`)) {
      return { type: "catchall", target: "*" };
    }

    return null;
  }

  static async check(email: string) {
    // Parse address and normalize it
    const features: DomainFeatures = {
      plusTagging: true,
      dotAliasing: false,
      lowercase: true,
    };

    const { baseLocal, domain, normalizedAddress } =
      Recipients.normalizeEmailAddress(email, features);

    const resolution = await Recipients.resolveRecipient(domain, baseLocal);

    if (!resolution) {
      return false;
    }

    return {
      email: normalizedAddress,
      type: resolution.type,
      target: resolution.target,
    };
  }
}
