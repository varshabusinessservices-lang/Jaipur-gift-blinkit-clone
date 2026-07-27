# Notification Event Catalog

## Overview
This catalog documents the domain events, payload contracts, recipient rules, and default notification templates implemented in Jaipur Gifting Batch 21.

---

## Event Catalog

### 1. `OTP_REQUESTED`
- **Category**: AUTHENTICATION
- **Channels**: SMS
- **Template**: `OTP_SMS`
- **Variables**: `{{otp}}`
- **Priority**: CRITICAL

### 2. `ORDER_CREATED`
- **Category**: ORDER
- **Channels**: EMAIL, WHATSAPP, IN_APP
- **Templates**: `ORDER_PLACED_EMAIL`, `ORDER_PLACED_WA`
- **Variables**: `{{orderNumber}}`, `{{totalAmount}}`, `{{deliverySlot}}`
- **Priority**: HIGH

### 3. `ORDER_OUT_FOR_DELIVERY`
- **Category**: DELIVERY
- **Channels**: PUSH, SMS
- **Template**: `DELIVERY_OUT_PUSH`
- **Variables**: `{{orderNumber}}`, `{{riderName}}`
- **Priority**: HIGH

### 4. `REFUND_COMPLETED`
- **Category**: REFUND
- **Channels**: EMAIL, IN_APP
- **Template**: `REFUND_COMPLETED_EMAIL`
- **Variables**: `{{orderNumber}}`, `{{refundAmount}}`
- **Priority**: HIGH
