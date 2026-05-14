const initialRegex = /[a-z0-9]/i;

function getJsonText(value: unknown, key: string) {
  if (!(value && typeof value === "object" && key in value)) {
    return null;
  }

  const text = (value as Record<string, unknown>)[key];
  return typeof text === "string" && text.trim() ? text.trim() : null;
}

function getFirstAddressValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value[0];
  }

  if (value && typeof value === "object" && "value" in value) {
    const nestedValue = (value as { value?: unknown }).value;
    if (Array.isArray(nestedValue)) {
      return nestedValue[0];
    }
  }

  return value;
}

function getSenderLabel(value: unknown) {
  const directText = getJsonText(value, "text");
  if (directText) {
    return directText;
  }

  const addressValue = getFirstAddressValue(value);
  const name = getJsonText(addressValue, "name");
  const address = getJsonText(addressValue, "address");

  return name || address || "Unknown sender";
}

function getInitial(label: string) {
  return label.match(initialRegex)?.[0].toUpperCase() ?? "?";
}

function getAttachmentCount(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    return undefined;
  }

  return value.length;
}

function formatInboxDate(date: Date) {
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {
    return `${Math.max(1, Math.floor(diff / minute))}m ago`;
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)}h ago`;
  }

  if (diff < 7 * day) {
    return `${Math.floor(diff / day)}d ago`;
  }

  return date.toLocaleDateString("en", {
    day: "numeric",
    month: "short",
  });
}

export function toDashboardEmail(email: {
  address: { email: string };
  attachments: unknown;
  date: Date;
  from: unknown;
  id: string;
  read: boolean;
  subject: string;
  text: string | null;
}) {
  const from = getSenderLabel(email.from);
  const snippet = email.text?.trim() || "No preview available.";

  return {
    attachments: getAttachmentCount(email.attachments),
    date: formatInboxDate(email.date),
    from,
    id: email.id,
    initial: getInitial(from),
    read: email.read,
    snippet,
    subject: email.subject,
    to: email.address.email,
  };
}
