# Wallets & Payments — Module Scaffolding Stub

## Source Snapshot (from SUPER_APP_MODULE_EXPANSION.md)
- **Purpose:** Unified wallet for P2P, merchant payments, and bill management.
- **MVP Feature Set:** Wallet balance + linked payment methods; P2P transfer requests/history; bill split flow (Messages integration); transaction list with categories + search.
- **Data Model Draft:** `WalletAccount`, `PaymentMethod`, `Transaction`, `SplitRequest`, `Merchant`.
- **Core Screens (no UI implementation yet):** Wallet overview, transaction detail, split bill modal, payment method manager.
- **Integration Hooks:** Budget (auto-categorize), Calendar (bill reminders), Messages (splits).
- **Analytics & Telemetry:** Payment success rate, transfer volume, recurring bills detected.
- **Security & Compliance:** KYC placeholder, encryption at rest, PCI-like considerations (stub).
- **Open Questions:** Payment processor selection; offline balance behavior.

## Scope & Intent
This file defines the Wallets & Payments module scaffolding without implementing UI or backend logic. It exists to align with production-ready patterns from Lists/Notebook/Calendar (CRUD + search + filtering + statistics + bulk operations) and to clarify integration touchpoints with other modules before any code is written.

## Core Functional Areas (Planned)
1. **Wallet Accounts**
   - Balance display sourced from external processor or local ledger.
   - Multi-currency support (future), single-currency in MVP.
2. **Payment Methods**
   - Tokenized cards/banks stored as references (no raw PAN data).
   - Status tracking (verified, pending, expired).
3. **Transactions & Transfers**
   - P2P transfer requests (pending/accepted/declined).
   - Merchant payments ledger with categories to sync with Budget.
4. **Bill Splitting**
   - Split request object, recipient list, and status tracking.
   - Integration with Messages for negotiation/approval flow.

## Data & Domain Modeling Notes
- **WalletAccount:** Owner, balance, currency, status, external provider ref.
- **PaymentMethod:** Type, last4, provider token, verification status.
- **Transaction:** Amount, counterparty, category, status, timestamps.
- **SplitRequest:** Initiator, recipients, allocation, status, message link.
- **Merchant:** Name, category, location, external id.

## Integration Touchpoints
- **Budget:** Auto-categorize transactions and export spend totals.
- **Calendar:** Bill reminders for recurring payments.
- **Messages:** Split request creation and response flows.
- **History:** Log payment events for timeline.
- **Alerts:** Payment failures, due bills.

## External Service Considerations
- Payment processor abstraction (Stripe/Adyen/etc.) should live behind a service adapter.
- KYC/AML and PCI compliance are placeholders; defer to provider capabilities.

## Analytics & Telemetry (Planned)
- Payment success/failure rates.
- Transfer volume over time.
- Split request completion rate.
- Recurring bill detection precision.

## Security & Privacy Baselines
- No storage of raw card data.
- Encrypted local storage for tokens and metadata.
- Consent-based sharing for split requests.

## Iterative Reasoning (No Implementation Yet)
### Iteration 1 — Minimal Viable Scaffold
- Establish data structures and storage interfaces for accounts, methods, and transactions.
- Define a transaction categorization contract for Budget sync.

### Iteration 2 — Cross-Module Cohesion
- Add event emitters for History/Alerts/Calendar to consume.
- Create split request handshake that Messages can reference.

### Iteration 3 — External Integration Readiness
- Introduce processor adapters with mocked responses for test harnessing.
- Add compliance check placeholders (KYC flags, verification status fields).

## Proposed File Scaffolding (No Code Yet)
- `shared/models/wallet/` — domain models and type definitions
- `server/services/wallet/` — processor adapters + orchestration stubs
- `client/modules/wallet/` — feature entry points (no UI implementation)
- `docs/vision/module_scaffolds/WALLET_AND_PAYMENTS.md` — this plan

## Open Questions to Resolve
- Payment processor selection and availability per region.
- Offline mode behavior for balances and transaction drafts.
