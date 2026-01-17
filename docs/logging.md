# Logging Best Practices

This guide explains how to implement efficient and effective logging in the Selfmail application using our Axiom-powered logging service.

## Overview

The logging service (`@selfmail/logging`) provides structured logging with automatic integration to Axiom for centralized log management and analysis. It supports multiple log levels and automatically falls back to console logging when Axiom is not configured.

## Quick Start

### Import and Create Logger

```typescript
import { createLogger } from "@selfmail/logging";

const logger = createLogger("service-name");
```

The service name should identify the component or service creating logs (e.g., `smtp-inbound`, `smtp-inbound-connection`, `api-auth`).

### Log Levels

Use appropriate log levels for different scenarios:

- **debug**: Detailed information for troubleshooting during development
- **info**: General informational messages about application flow
- **warn**: Warning messages for potentially problematic situations
- **error**: Error messages for failures and exceptions

## Usage Examples

### Basic Logging

```typescript
logger.info("Server started", { port: 25, maxSize: 25 * 1024 * 1024 });
logger.debug("Processing request", { requestId: "abc123" });
logger.warn("Rate limit approaching", { current: 95, limit: 100 });
```

### Error Logging

Always pass the Error object when logging errors:

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error(
    "Operation failed",
    error instanceof Error ? error : undefined,
    { userId: "user123", operation: "riskyOperation" }
  );
}
```

### Structured Context

Always use structured context objects instead of string interpolation:

```typescript
logger.info("Email saved successfully", {
  messageId: parsed.messageId,
  recipient: recipientEmail,
  sender,
  subject: parsed.subject || "(no subject)",
});
```

Instead of:

```typescript
console.log(`Email ${parsed.messageId} saved for ${recipientEmail}`);
```

## Best Practices

### 1. Use Descriptive Service Names

Service names should clearly identify the component:

```typescript
const logger = createLogger("smtp-inbound-connection");
const logger = createLogger("smtp-inbound-data");
const logger = createLogger("api-auth-oauth");
```

### 2. Structure Your Log Context

Include relevant context that will be useful for filtering and searching:

```typescript
logger.info("Connection accepted", {
  clientIP: "192.168.1.1",
  hostname: "mail.example.com",
});

logger.warn("Storage limit exceeded", {
  recipientEmail: "user@example.com",
  availableStorage: "1024000",
  emailSize: "2048000",
});
```

### 3. Choose the Right Log Level

- **debug**: Use sparingly in production; helpful during development
  ```typescript
  logger.debug("Rspamd check result", {
    action: rspamdResult.action,
    score: rspamdResult.score,
  });
  ```

- **info**: Normal application flow and successful operations
  ```typescript
  logger.info("Email processed", { messageId: "abc123" });
  ```

- **warn**: Recoverable issues or degraded functionality
  ```typescript
  logger.warn("Invalid HELO/EHLO hostname", { clientHostname });
  ```

- **error**: Failures that require attention
  ```typescript
  logger.error("Database connection failed", error, { retryCount: 3 });
  ```

### 4. Include Error Objects

When logging errors, always pass the Error object as the second parameter:

```typescript
logger.error(
  "Unexpected error during connection check",
  error instanceof Error ? error : undefined
);
```

This captures the stack trace and error details in Axiom.

### 5. Avoid Logging Sensitive Data

Never log sensitive information:

```typescript
logger.info("User authenticated", {
  userId: user.id,
  email: user.email,
});
```

### 6. Keep Messages Concise

Log messages should be brief and descriptive:

```typescript
logger.info("Connection accepted", { clientIP });
logger.warn("Connection rejected: Private IP", { clientIP });
logger.error("Storage limit exceeded", { recipientEmail, emailSize });
```

### 7. Use Consistent Field Names

Maintain consistency in context field names across the application:

- `clientIP` not `client_ip` or `ip_address`
- `recipientEmail` not `recipient` or `email`
- `messageId` not `message_id` or `id`

## Configuration

The logging service requires environment variables to connect to Axiom:

```bash
AXIOM_TOKEN=your_axiom_token
AXIOM_ORG_ID=your_axiom_org_id
```

When these are not set, logs will only be written to the console.

### Custom Dataset

By default, logs are sent to the `selfmail` dataset. You can specify a custom dataset:

```typescript
const logger = createLogger("service-name", "custom-dataset");
```

## Performance Considerations

### Minimize Debug Logs in Production

Debug logs should be used sparingly in production to avoid performance overhead and log volume:

```typescript
if (process.env.NODE_ENV === "development") {
  logger.debug("Detailed state", { ...largeObject });
}
```

### Avoid Expensive Operations in Log Context

Don't perform expensive operations to generate log context:

```typescript
logger.info("Data processed", {
  count: items.length,
  total: total.toString(),
});
```

### Batch Related Logs

For operations that process multiple items, consider logging summaries instead of individual items:

```typescript
const processed = [];
const failed = [];

for (const item of items) {
  try {
    await process(item);
    processed.push(item.id);
  } catch (error) {
    failed.push(item.id);
  }
}

logger.info("Batch processing completed", {
  totalProcessed: processed.length,
  totalFailed: failed.length,
  failedIds: failed,
});
```

## Querying Logs in Axiom

With structured logging, you can easily query logs in Axiom:

```
service == "smtp-inbound-connection" and level == "error"
service == "smtp-inbound-data" and recipientEmail == "user@example.com"
service contains "smtp" and clientIP == "192.168.1.1"
```

## Migration from Console Logging

Replace console.log/warn/error calls with the logger:

### Before
```typescript
console.log(`[Connection] New connection from IP: ${clientIP}, Hostname: ${clientHostname}`);
console.warn(`[Connection] Rejected: Private IP address: ${clientIP}`);
console.error("Error in DATA handler:", error);
```

### After
```typescript
logger.info("New connection", { clientIP, clientHostname });
logger.warn("Connection rejected: Private IP", { clientIP });
logger.error("Error in DATA handler", error instanceof Error ? error : undefined);
```