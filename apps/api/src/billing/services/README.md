# Billing Services

This directory contains a well-organized collection of services to handle Stripe webhook events and billing operations for the Selfmail application.

## Structure

```
services/
├── customer.ts        # Customer-related webhook handlers
├── helpers.ts         # Common billing utilities and data operations
├── logger.ts          # Billing-specific logging service
├── notifications.ts   # Billing notification management
├── payment.ts         # Payment success/failure handlers
├── subscription.ts    # Subscription lifecycle management
└── types.ts          # Stripe type helpers and utilities
```

## Service Overview

### Main Services

- **BillingService** (`../service.ts`) - Main orchestrator that routes webhook events to appropriate handlers
- **SubscriptionService** - Handles subscription creation, updates, and cancellations
- **PaymentService** - Manages payment success and failure events
- **CustomerService** - Handles customer lifecycle events

### Utility Services

- **BillingHelpers** - Common database operations and utility functions
- **BillingLogger** - Specialized logging for billing operations
- **NotificationService** - Sends notifications for billing events
- **StripeHelpers** - Type-safe access to Stripe object properties

## Features Implemented

### ✅ Subscription Management
- Create subscriptions from Stripe webhooks
- Update subscription status and plan changes
- Handle subscription cancellations
- Track subscription history
- Manage seat-based billing

### ✅ Payment Processing
- Record successful payments
- Handle payment failures
- Track payment history
- Automatic retry logic for failed payments
- Workspace overlimit management

### ✅ Notification System
- Integration with existing notification system
- Billing alerts and warnings
- User notifications for billing events

### ✅ Database Integration
- Comprehensive Prisma schema for billing
- Subscription history tracking
- Payment records
- Billing alerts
- Seat management

## Enhanced Prisma Schema

The billing system includes several new models:

- **Subscription** - Enhanced with detailed billing information
- **SubscriptionHistory** - Tracks all subscription changes
- **PaymentRecord** - Complete payment transaction history
- **BillingAlert** - System alerts for billing issues
- **WorkspaceSeats** - Seat-based billing management

## TODO Items

The following items are marked with TODO comments for future implementation:

### Logging & Activity Feed
- **Subscription events**: Log all subscription changes to workspace activity feed
- **Payment events**: Log payment successes/failures to activity feed
- **Customer events**: Log customer lifecycle events

### Notifications
- **Welcome emails**: Send welcome notifications for new subscriptions
- **Plan changes**: Notify users about plan upgrades/downgrades
- **Payment confirmations**: Send receipt emails for successful payments
- **Payment failures**: Send dunning emails for failed payments
- **Subscription cancellations**: Send cancellation confirmation emails

### Advanced Features
- **Dunning management**: Implement smart retry logic for failed payments
- **Usage tracking**: Monitor and enforce plan limits
- **Prorations**: Handle mid-cycle plan changes
- **Tax calculation**: Integrate tax calculation for different regions
- **Invoice generation**: Generate custom invoices

### Data Management
- **Data retention**: Implement policies for canceled subscriptions
- **Exports**: Allow users to export billing data
- **Analytics**: Billing metrics and reporting

## Usage

The billing service is automatically triggered by Stripe webhooks. To use:

1. Configure Stripe webhook endpoint to call `BillingService.processWebhook()`
2. Set required environment variables:
   - `STRIPE_API_KEY`
   - `STRIPE_WEBHOOK_SECRET`
3. Ensure database schema is up to date with `prisma db push`

## Error Handling

All services include comprehensive error handling:
- Detailed error logging with context
- Graceful degradation for non-critical failures
- Webhook event replay support
- Transaction rollback for data consistency

## Type Safety

The codebase maintains strict TypeScript compliance:
- Proper Stripe type definitions
- Custom type helpers for complex operations
- Null-safe database operations
- Comprehensive error types