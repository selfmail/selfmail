# Email Security and Parsing Utilities

This module provides production-ready email parsing and security utilities for the Selfmail SMTP server.

## Features

### Security Service (`security.ts`)

The `SecurityService` provides comprehensive security features for email processing:

#### HTML Sanitization
- **DOMPurify**: Primary XSS protection and DOM sanitization
- **XSS Library**: Additional XSS filtering with custom rules
- **sanitize-html**: Comprehensive HTML cleaning and validation
- **Custom Security Rules**: Application-specific security policies

#### Content Validation
- **Email Address Validation**: Using the `validator` library with normalization
- **URL Extraction and Validation**: Safe URL parsing and validation
- **File Attachment Security**: Filename sanitization and dangerous file detection
- **Content Filtering**: Removal of control characters and suspicious patterns

#### Security Options
```typescript
// Default options for email content
SecurityService.DEFAULT_EMAIL_OPTIONS

// Strict options for untrusted content  
SecurityService.STRICT_OPTIONS
```

#### Key Methods

##### `sanitizeHtml(html: string, options?: SecurityOptions): SanitizationResult`
Multi-layer HTML sanitization with threat detection:
- DOMPurify for XSS protection
- XSS library for additional filtering
- sanitize-html for comprehensive cleaning
- Custom pattern detection for suspicious content

##### `sanitizeText(text: string, options?: SecurityOptions): SanitizationResult`
Plain text sanitization:
- Control character removal
- Suspicious pattern detection
- Length limits enforcement

##### `validateEmail(email: string): string | null`
Email validation and normalization:
- RFC compliance checking
- Domain validation
- Email normalization (lowercase, etc.)

##### `validateAttachment(filename: string, contentType: string, size: number)`
File attachment security validation:
- Dangerous extension detection
- MIME type validation
- Filename sanitization
- Size limit enforcement

### Parse Service (`parse.ts`)

The `Parse` class provides secure email parsing with integrated security features:

#### Key Features
- **Integrated Security**: All parsed content is automatically sanitized
- **Email Address Validation**: All email addresses are validated and normalized
- **Attachment Security**: File attachments are validated for security threats
- **Content Sanitization**: HTML and text content is sanitized using SecurityService
- **Threat Reporting**: Detailed security threat information is included

#### Schemas

##### `InboundEmailSchema`
For emails received by the SMTP server:
- Comprehensive email field validation
- Security metadata inclusion
- Attachment security validation

##### `OutboundEmailSchema`
For emails being sent through the SMTP server:
- Sender validation requirements
- Priority and routing information

##### `SpamCheckSchema`
For spam analysis integration with rspamd and ClamAV

#### Methods

##### `inboundEmail(email: ParsedMail, sessionId?: string, remoteAddress?: string): Promise<InboundEmail>`
Parses and secures inbound emails:
- Email address validation and normalization
- Content sanitization (HTML, text, subject)
- Attachment security validation
- Security threat tracking

Example usage:
```typescript
const parsedEmail = await simpleParser(stream);
const secureEmail = await Parse.inboundEmail(
  parsedEmail, 
  session.id, 
  session.remoteAddress
);

// Check for security threats
if (secureEmail.securityInfo?.threats.length > 0) {
  console.log('Security threats detected:', secureEmail.securityInfo.threats);
}
```

##### `outboundEmail(emailData: unknown): Promise<OutboundEmail>`
Validates outbound email data structure.

##### `spamCheck(emailData: unknown): Promise<SpamCheck>`
Prepares email data for spam analysis.

## Security Integrations

### rspamd Integration
The system integrates with rspamd for comprehensive spam detection:
- Content analysis
- Header validation
- Reputation checking
- Machine learning-based detection

### ClamAV Integration
File attachments are scanned using ClamAV:
- Virus detection
- Malware scanning
- Real-time threat detection
- Socket-based communication with clamd

## Production Deployment

### Dependencies
```bash
# Core security packages
npm install isomorphic-dompurify xss validator sanitize-html

# Type definitions
npm install -D @types/validator @types/sanitize-html
```

### Configuration

#### Security Options
Configure security levels based on your requirements:

```typescript
// For trusted content (internal emails)
const trustedOptions: SecurityOptions = {
  allowedTags: [...SecurityService.DEFAULT_EMAIL_OPTIONS.allowedTags, "style"],
  maxLength: 5 * 1024 * 1024, // 5MB
  stripScripts: true,
};

// For external emails (strict mode)
const externalOptions = SecurityService.STRICT_OPTIONS;
```

#### rspamd Setup
Ensure rspamd is running and accessible:
```bash
# Default rspamd endpoint
http://127.0.0.1:11333/checkv2
```

#### ClamAV Setup
Ensure ClamAV daemon is running:
```bash
# Default clamd socket
127.0.0.1:3310
```

### Performance Considerations

1. **Content Limits**: Set appropriate `maxLength` limits for content
2. **Attachment Scanning**: Configure timeouts for ClamAV scanning
3. **Caching**: Consider caching sanitized content for repeated processing
4. **Monitoring**: Monitor security threat logs for patterns

### Security Best Practices

1. **Regular Updates**: Keep security libraries updated
2. **Threat Monitoring**: Monitor and alert on security threats
3. **Content Filtering**: Implement additional content filtering as needed
4. **Logging**: Log all security events for analysis
5. **Testing**: Regularly test with malicious content samples

## Error Handling

The security services are designed to fail safely:
- Invalid content is sanitized rather than rejected
- Security errors default to safe behavior
- Detailed threat information is provided for monitoring
- Graceful degradation when security services are unavailable

## Monitoring and Alerting

Track these metrics in production:
- Security threats detected per hour/day
- Content modification rates
- Attachment rejection rates
- Performance impact of security scanning

## Example Integration

```typescript
// Complete email processing with security
const handleInboundEmail = async (stream: SMTPServerDataStream, session: SMTPServerSession) => {
  try {
    // Parse email
    const parsed = await simpleParser(stream);
    
    // Secure and validate
    const secureEmail = await Parse.inboundEmail(parsed, session.id, session.remoteAddress);
    
    // Check security threats
    if (secureEmail.securityInfo?.threats.length > 0) {
      console.log('Security threats:', secureEmail.securityInfo.threats);
      // Optional: reject emails with severe threats
    }
    
    // Check insecure attachments
    const insecureAttachments = secureEmail.attachments?.filter(att => !att.isSecure) || [];
    if (insecureAttachments.length > 0) {
      console.log('Insecure attachments detected:', insecureAttachments.map(a => a.filename));
    }
    
    // Process the secure email
    await processSecureEmail(secureEmail);
    
  } catch (error) {
    console.error('Email processing failed:', error);
    throw error;
  }
};
```

This comprehensive security framework ensures that all email content is properly sanitized and validated before processing, providing robust protection against XSS, injection attacks, malware, and other security threats.
