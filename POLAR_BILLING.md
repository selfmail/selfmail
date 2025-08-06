# Polar Billing Integration

This document describes the Polar billing integration implemented in the `Payments` class for organization subscription management.

## Overview

The billing system implements a freemium model where organizations can upgrade to premium subscriptions to unlock additional features and higher limits.

### Subscription Tiers

**Free Tier:**
- 1 user maximum
- 1 GB storage
- 1 email address
- No API access

**Premium Tier:**
- 3 users maximum
- 50 GB storage
- 10 email addresses
- API access enabled

## Environment Variables

Add the following environment variable to your `.env` file:

```bash
# Polar API Access Token
POLAR_ACCESS_TOKEN=your_polar_access_token_here
```

You can obtain this token from your Polar dashboard at https://polar.sh

## Implementation Details

### Core Methods

#### `processPayment(workspaceId, ownerEmail, ownerName?)`

Initiates payment processing for an organization:

- Creates or retrieves a Polar customer using the workspace ID as external ID
- Checks for existing active subscriptions
- Finds available premium products
- Returns payment processing status

**Usage:**
```typescript
const result = await Payments.processPayment(
  "workspace_123", 
  "owner@example.com", 
  "John Doe"
);

if (result.success) {
  console.log("Payment initiated:", result.customerId);
} else {
  console.error("Payment failed:", result.message);
}
```

#### `webhook(payload)`

Handles Polar webhook events:

- `subscription.created/updated`: Reactivates suspended organizations
- `subscription.canceled/revoked`: Checks limits and suspends if necessary
- `payment.succeeded/failed`: Logs payment events

**Usage:**
```typescript
// In your webhook endpoint
const payload = {
  type: "subscription.created",
  data: {
    id: "sub_123",
    customer_id: "cust_456",
    status: "active"
  }
};

await Payments.webhook(payload);
```

#### `checkUser(workspaceId)`

Checks organization status and enforces limits:

- Retrieves workspace data and calculates current usage
- Checks Polar for active subscriptions
- Determines if organization is within limits
- Suspends organization if limits are exceeded and no premium subscription

**Usage:**
```typescript
const status = await Payments.checkUser("workspace_123");

console.log("Premium:", status.isPremium);
console.log("Within limits:", status.withinLimits);
console.log("Suspended:", status.suspended);
console.log("Current usage:", status.currentUsage);
```

### Organization Suspension Logic

Organizations are suspended when:
1. They exceed their tier limits (users, storage, or addresses)
2. They don't have an active premium subscription

When suspended:
- Email storage is blocked (implementation needed in SMTP layer)
- Organization operations are restricted
- Users receive notifications about the suspension

### Storage Calculation

The current implementation provides a basic storage calculation based on email content length. For production use, consider:

1. **Database storage tracking**: Add a `storageUsed` field to track actual storage
2. **Attachment handling**: Factor in attachment sizes
3. **Compression**: Account for database compression
4. **Caching**: Cache storage calculations for performance

### Integration Points

#### SMTP Service Integration

To properly enforce limits, the SMTP service should check organization status:

```typescript
// In your SMTP email processing
const status = await Payments.checkUser(workspaceId);

if (status.suspended) {
  throw new Error("Organization suspended - upgrade required");
}

if (status.currentUsage.storageGB >= status.limits.maxStorageGB) {
  throw new Error("Storage limit exceeded");
}
```

#### API Rate Limiting

For API access control:

```typescript
// In API middleware
const status = await Payments.checkUser(workspaceId);

if (!status.limits.hasApiAccess) {
  return res.status(403).json({ error: "API access requires premium subscription" });
}
```

## Database Schema Updates

Consider adding these fields to the `Workspace` model for better tracking:

```prisma
model Workspace {
  // ... existing fields
  
  // Billing fields
  suspended       Boolean   @default(false)
  suspendedAt     DateTime?
  suspensionReason String?
  storageUsedGB   Float     @default(0)
  lastBillingCheck DateTime?
  
  // Polar integration
  polarCustomerId String?   @unique
}
```

## Webhook Setup

Configure webhooks in your Polar dashboard to point to your API endpoint:

**Webhook URL:** `https://yourdomain.com/api/webhooks/polar`

**Events to subscribe to:**
- `subscription.created`
- `subscription.updated`
- `subscription.canceled`
- `subscription.revoked`
- `payment.succeeded`
- `payment.failed`

## Error Handling

The implementation includes comprehensive error handling:

- Network failures with Polar API
- Missing customer data
- Invalid workspace IDs
- Database connection issues

All errors are logged and gracefully handled without crashing the application.

## Testing

To test the billing integration:

1. **Mock Polar API**: Use test mode in Polar dashboard
2. **Webhook testing**: Use tools like ngrok for local webhook testing
3. **Load testing**: Test with multiple concurrent billing operations
4. **Edge cases**: Test with invalid data, network failures, etc.

## Security Considerations

1. **Access Token**: Store `POLAR_ACCESS_TOKEN` securely
2. **Webhook validation**: Verify webhook signatures from Polar
3. **Data privacy**: Handle customer billing data according to regulations
4. **Rate limiting**: Implement rate limiting for billing API calls

## Production Checklist

Before deploying to production:

- [ ] Configure `POLAR_ACCESS_TOKEN` environment variable
- [ ] Set up Polar webhooks
- [ ] Add database indices for billing queries
- [ ] Implement proper logging and monitoring
- [ ] Set up alerts for billing failures
- [ ] Test subscription flows end-to-end
- [ ] Implement proper error notifications to users
- [ ] Add billing analytics and reporting

## Support and Troubleshooting

Common issues and solutions:

**"Customer not found"**: Ensure workspace has been properly created in Polar

**"Product not found"**: Verify premium products exist in your Polar organization

**"Webhook failures"**: Check webhook URL accessibility and signature validation

**"Storage calculation errors"**: Review database relationships and data integrity

For additional support, refer to:
- [Polar Documentation](https://docs.polar.sh)
- [Polar SDK Reference](https://github.com/polarsource/polar-js)
