import type { SecurityOptions } from "./security";

/**
 * Production security configuration for Selfmail SMTP server
 */
export const SecurityConfig = {
  /**
   * Security options for inbound emails from external sources
   */
  INBOUND_EMAIL: {
    allowedTags: [
      // Basic formatting
      "p", "br", "div", "span",
      // Text styling
      "strong", "b", "em", "i", "u", "s", "sup", "sub",
      // Lists
      "ul", "ol", "li",
      // Headings
      "h1", "h2", "h3", "h4", "h5", "h6",
      // Quotes and code
      "blockquote", "pre", "code",
      // Links and images (with restrictions)
      "a", "img",
      // Tables
      "table", "thead", "tbody", "tfoot", "tr", "td", "th",
      // Other semantic elements
      "hr", "address", "cite", "small"
    ],
    allowedAttributes: {
      "a": ["href", "title", "target"],
      "img": ["src", "alt", "width", "height", "title"],
      "table": ["border", "cellpadding", "cellspacing"],
      "td": ["colspan", "rowspan", "align", "valign"],
      "th": ["colspan", "rowspan", "align", "valign"],
      "*": ["class", "id", "style"] // Limited style attributes
    },
    maxLength: 2 * 1024 * 1024, // 2MB for external emails
    stripScripts: true,
    normalizeEmails: true,
  } as SecurityOptions,

  /**
   * Security options for outbound emails (more permissive)
   */
  OUTBOUND_EMAIL: {
    allowedTags: [
      // All inbound tags plus additional ones
      "p", "br", "div", "span", "strong", "b", "em", "i", "u", "s", "sup", "sub",
      "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6",
      "blockquote", "pre", "code", "a", "img", "table", "thead", "tbody", "tfoot",
      "tr", "td", "th", "hr", "address", "cite", "small",
      // Additional styling elements
      "style", "center", "font"
    ],
    allowedAttributes: {
      "a": ["href", "title", "target", "rel"],
      "img": ["src", "alt", "width", "height", "title", "border"],
      "table": ["border", "cellpadding", "cellspacing", "width", "align"],
      "td": ["colspan", "rowspan", "align", "valign", "width", "height"],
      "th": ["colspan", "rowspan", "align", "valign", "width", "height"],
      "font": ["color", "size", "face"],
      "*": ["class", "id", "style", "align", "bgcolor", "color"]
    },
    maxLength: 10 * 1024 * 1024, // 10MB for outbound emails
    stripScripts: true,
    normalizeEmails: true,
  } as SecurityOptions,

  /**
   * Strict security options for untrusted content
   */
  STRICT: {
    allowedTags: ["p", "br", "strong", "b", "em", "i"],
    allowedAttributes: {},
    maxLength: 50 * 1024, // 50KB
    stripScripts: true,
    normalizeEmails: true,
  } as SecurityOptions,

  /**
   * Security options for subject lines (very strict)
   */
  SUBJECT: {
    allowedTags: [], // No HTML in subjects
    allowedAttributes: {},
    maxLength: 998, // RFC 5322 limit
    stripScripts: true,
    normalizeEmails: false,
  } as SecurityOptions,

  /**
   * File attachment security settings
   */
  ATTACHMENTS: {
    // Maximum file size (25MB - typical email limit)
    maxFileSize: 25 * 1024 * 1024,
    
    // Allowed file extensions
    allowedExtensions: [
      // Documents
      ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
      ".odt", ".ods", ".odp", ".rtf", ".txt",
      // Images
      ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp",
      // Archives (with scanning)
      ".zip", ".tar", ".gz", ".7z", ".rar",
      // Other common formats
      ".csv", ".json", ".xml", ".html", ".css", ".js"
    ],
    
    // Blocked file extensions (executable and dangerous files)
    blockedExtensions: [
      ".exe", ".bat", ".cmd", ".com", ".pif", ".scr", ".vbs", ".js",
      ".jar", ".app", ".deb", ".rpm", ".dmg", ".pkg", ".msi",
      ".ps1", ".sh", ".bash", ".csh", ".fish"
    ],
    
    // Allowed MIME types
    allowedMimeTypes: [
      // Text formats
      "text/plain", "text/html", "text/css", "text/csv",
      // Documents
      "application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      // Images
      "image/jpeg", "image/png", "image/gif", "image/bmp", "image/svg+xml", "image/webp",
      // Archives
      "application/zip", "application/x-tar", "application/gzip",
      "application/x-7z-compressed", "application/x-rar-compressed",
      // Other
      "application/json", "application/xml", "application/octet-stream"
    ],
    
    // Blocked MIME types
    blockedMimeTypes: [
      "application/x-executable", "application/x-msdownload",
      "application/x-msdos-program", "application/javascript",
      "text/javascript", "application/x-shellscript"
    ],
  },

  /**
   * rspamd integration settings
   */
  RSPAMD: {
    endpoint: "http://127.0.0.1:11333/checkv2",
    timeout: 30000, // 30 seconds
    headers: {
      "Content-Type": "message/rfc822",
      "User-Agent": "Selfmail-SMTP/1.0",
    },
    // Threshold scores
    rejectScore: 5.0,
    flagScore: 2.0,
  },

  /**
   * ClamAV integration settings
   */
  CLAMAV: {
    host: "127.0.0.1",
    port: 3310,
    timeout: 30000, // 30 seconds
    maxFileSize: 25 * 1024 * 1024, // 25MB
    fallbackBehavior: "allow", // "allow" or "reject" when ClamAV is unavailable
  },

  /**
   * Content filtering settings
   */
  CONTENT_FILTERING: {
    // URLs and links
    allowExternalLinks: true,
    allowedProtocols: ["http", "https", "mailto", "ftp"],
    blockedDomains: [
      // Add known malicious domains here
    ],
    
    // Text filtering
    maxLineLength: 998, // RFC 5322 limit
    maxLines: 10000,
    
    // Character filtering
    allowUnicode: true,
    normalizeLineEndings: true,
  },

  /**
   * Logging and monitoring settings
   */
  MONITORING: {
    logSecurityThreats: true,
    logContentModifications: true,
    logAttachmentRejections: true,
    alertOnHighThreatCount: 10, // Alert if more than 10 threats per hour
    alertOnVirusDetection: true,
  },
} as const;

/**
 * Get security options based on email direction and trust level
 */
export function getSecurityOptions(direction: "inbound" | "outbound", trustLevel: "strict" | "normal" = "normal"): SecurityOptions {
  if (trustLevel === "strict") {
    return SecurityConfig.STRICT;
  }
  
  return direction === "inbound" 
    ? SecurityConfig.INBOUND_EMAIL 
    : SecurityConfig.OUTBOUND_EMAIL;
}

/**
 * Validate configuration at startup
 */
export function validateSecurityConfig(): boolean {
  try {
    // Check rspamd connectivity
    fetch(SecurityConfig.RSPAMD.endpoint, { 
      method: "HEAD",
      signal: AbortSignal.timeout(5000)
    }).catch(() => {
      console.warn("rspamd not accessible at", SecurityConfig.RSPAMD.endpoint);
    });

    // Check ClamAV connectivity
    const net = require("node:net");
    const socket = net.createConnection({ 
      port: SecurityConfig.CLAMAV.port, 
      host: SecurityConfig.CLAMAV.host 
    });
    
    socket.setTimeout(5000);
    socket.on("connect", () => {
      socket.write("zPING\0");
    });
    
    socket.on("data", (data: Buffer) => {
      const response = data.toString().trim();
      if (response !== "PONG") {
        console.warn("ClamAV not responding correctly");
      }
      socket.end();
    });
    
    socket.on("error", () => {
      console.warn("ClamAV not accessible at", `${SecurityConfig.CLAMAV.host}:${SecurityConfig.CLAMAV.port}`);
    });

    return true;
  } catch (error) {
    console.error("Security configuration validation failed:", error);
    return false;
  }
}
