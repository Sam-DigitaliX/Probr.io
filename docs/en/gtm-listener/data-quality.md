# Data Quality Monitoring

Probr automatically analyzes the quality of data flowing through your sGTM container. This page explains the quality metrics and how to interpret them.

## User Data Quality (Enhanced Conversions)

### Why It Matters

Enhanced Conversions for Google Ads, Meta CAPI, and other platforms depend on the presence of first-party user data:

- **Email** -> user matching for attribution
- **Phone** -> complementary signal for matching
- **Address** (first name, last name, city, country) -> improves match rate

Low presence rate = low match rate = fewer attributed conversions = underestimated ROAS.

### What Probr Checks

For each event, Probr checks the **presence** (non-empty) of the following fields:

| Field | Path in sGTM event | Impact |
|---|---|---|
| Email | `user_data.email_address` | Critical — primary signal for matching |
| Phone | `user_data.phone_number` | Important — improves match rate by ~15% |
| First name | `user_data.address.first_name` | Useful — address matching |
| Last name | `user_data.address.last_name` | Useful — address matching |
| City | `user_data.address.city` | Complementary |
| Country | `user_data.address.country` | Complementary |

### Recommended Targets

| Metric | Target | Critical if below |
|---|---|---|
| Email presence rate | >70% on conversions | <40% |
| Phone presence rate | >30% | <10% |
| Address presence rate | >50% | <20% |

> These targets apply to **conversion** events (purchase, generate_lead, sign_up). It's normal for page_view events to have a lower rate.

### How to Improve Rates

If your rates are low:

1. **Check your client-side dataLayer**: is `user_data` being pushed to the dataLayer before the conversion event?
2. **Check the sGTM client**: does the client (GA4, custom) properly transmit `user_data` in the event data?
3. **Forms**: ensure your checkout/login forms collect this data and make it available in the dataLayer
4. **Consent**: if you use a CMP, verify that marketing consent is granted before sending user data

---

## E-commerce Data Quality

### Why It Matters

Incomplete e-commerce data causes:

- **Loss of revenue tracking** in GA4 if `value` or `currency` is missing
- **Impossible deduplication** if `transaction_id` is missing (purchases counted twice)
- **Broken item reports** if `items` is missing (no product performance)

### What Probr Checks

On `purchase`, `begin_checkout`, `add_to_cart`, and `add_payment_info` events:

| Field | Path | Impact if absent |
|---|---|---|
| `value` | `value` | Revenue not tracked |
| `currency` | `currency` | Revenue in unknown currency |
| `transaction_id` | `transaction_id` | Risk of duplicates |
| `items` | `items` | No product data |

### Recommended Targets

| Metric | Target |
|---|---|
| value present on purchase | **100%** |
| currency present on purchase | **100%** |
| transaction_id present on purchase | **100%** |
| items present on purchase | **>95%** |

> On `add_to_cart` and `begin_checkout`, a 100% rate for `items` is expected. For `value`, it may vary depending on your implementation.

---

## Quality Dashboard

In the Probr dashboard, the **Data Quality** tab displays:

1. **Overall score**: weighted completeness percentage
2. **Trends**: presence rate evolution over 7/30 days
3. **Alerts**: notification if a rate drops below the critical threshold
4. **Detail by event**: breakdown by event type (purchase vs page_view vs add_to_cart)

### Interpreting the Overall Score

| Score | Interpretation |
|---|---|
| **90-100%** | Excellent — your implementation is solid |
| **70-89%** | Good — some improvements possible |
| **50-69%** | Warning — data is regularly missing |
| **<50%** | Critical — implementation issue to fix |
