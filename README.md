# Aura — Autonomous Vibe-Coding Studio

![Aura Banner](/public/aura-logo.svg)

> **Aura** is a production-ready, luxury autonomous vibe-coding studio where builders type app prompts and watch the proprietary **Aura Autonomous Engine** architect full-stack applications with true reactive state, local persistence, live dynamic calculations, and instant sandbox execution.

---

## Key Highlights

- **Dual-Pane Autonomous Studio Aesthetic**: Sleek luxury dark obsidian canvas (`#09090b`), dual-pane reactive layout with conversational prompt copilot on the left and live responsive sandbox iframe on the right.
- **Aura Autonomous Engine (`v2.5 Ultra`)**:
  - Powered by high-speed frontier MoE reasoning architecture with native speculative decoding and hybrid Transformer-Mamba design.
  - Zero identity disclosure: completely white-labeled, proprietary AI engine experience with zero vendor leakage.
  - Scaled token outputs: 8,000 to 24,000 output token context across tiers.
  - Automated high-throughput failover route and local synthesis fallback matrix.
- **Production Cashfree Payment Gateway Integration**:
  - Seamless subscription checkouts for Indian and global users (UPI, Netbanking, Cards).
  - Automated order creation (`/api/payments/cashfree/create-order`).
  - Cashfree v3 JS SDK Dropin modal checkout.
  - Verification API (`/api/payments/cashfree/verify`).
  - Production Webhook handler (`/api/payments/cashfree/webhook`) with HMAC SHA256 signature verification.
- **Fair Usage Policy (FUP) & Sustainable Unit Economics**:
  - **Free Tier**: 5 requests/day limit, instant prototyping.
  - **Starter Tier ($5 / month / ₹449 INR)**: 15 requests/day limit, ~$2 profit margin per subscriber.
  - **Creator / Mid Tier ($15 / month / ₹1,329 INR)**: 60 requests/day limit, ~$7 profit margin per subscriber.
  - **Pro Tier ($30 / month / ₹2,649 INR)**: 200 requests/day limit, ~$15 profit margin per subscriber.
  - Dynamic quota meter with 24-hour UTC reset logic and real-time upgrade alerts.
- **Multi-Viewport Interactive Sandbox**:
  - Desktop (100%), Tablet (768px), and Mobile (375px) responsive frames.
  - Hot reload, full-screen expansion, console error inspector, and self-healing auto-fix.
- **Code Explorer & Export**:
  - Syntax-highlighted multi-file explorer (`App.tsx`, `index.html`, `styles.css`).
  - 1-click Standalone HTML download and React component clipboard copy.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Payment Gateway**: Cashfree PG API v2023-08-01 & Cashfree JS SDK v3
- **Autonomous Engine**: Aura Autonomous Engine (`v2.5 Ultra`)
- **Auth**: Firebase Authentication with seamless local demo sandbox fallback
- **Language**: TypeScript 5

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/ussainakbar70-blip/aura.git
cd aura
npm install
```

### 2. Environment Variables

Create `.env.local` based on `.env.example`:

```env
# Cashfree Production Credentials
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENV=production
NEXT_PUBLIC_CASHFREE_ENV=production

# Autonomous Compute Engine
OPENROUTER_API_KEY=your_compute_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Firebase Authentication
# NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── account/route.ts                 # User account telemetry & plan status
│   │   ├── generate/route.ts                # Autonomous Engine SSE streaming route
│   │   ├── payments/cashfree/
│   │   │   ├── create-order/route.ts        # Cashfree PG order creation
│   │   │   ├── verify/route.ts              # Cashfree payment verification
│   │   │   └── webhook/route.ts             # Webhook signature & tier update
│   │   ├── projects/                        # Project storage, forks & versioning
│   │   └── usage/route.ts                   # Daily limits & FUP economics
│   ├── app/page.tsx                         # Studio redirect
│   ├── login/page.tsx                       # Production login with demo fallback
│   ├── signup/page.tsx                      # Production registration with password strength
│   ├── studio/page.tsx                      # Main Aura dual-pane studio workspace
│   ├── globals.css                          # Luxury dark tokens & custom scrollbars
│   ├── layout.tsx                           # App metadata & brand favicon
│   └── page.tsx                             # Showcase landing page
├── components/
│   ├── AuraLogo.tsx                         # Brand mark with ivory/sandal blend
│   ├── AuthModal.tsx                        # Quick modal authentication
│   ├── ChatPanel.tsx                        # Autonomous copilot & timeline execution matrix
│   ├── CodePanel.tsx                        # Multi-file tabbed code explorer
│   ├── ExportModal.tsx                      # Code and bundle exporter
│   ├── Navbar.tsx                           # Studio header, viewports & tier pills
│   ├── PreviewPanel.tsx                     # Live interactive sandbox iframe
│   ├── PricingModal.tsx                     # Cashfree checkout & FUP table
│   ├── ProjectsDrawer.tsx                   # Project history & version snapshots
│   ├── SettingsModal.tsx                    # Dedicated Compute Key & diagnostics
│   └── ShareModal.tsx                       # Live preview links & embed code
├── config/
│   ├── models.ts                            # Autonomous Engine routing & specs
│   └── plans.ts                             # Subscription tiers & economics
├── lib/
│   ├── cashfree.ts                          # Cashfree PG server client & HMAC verify
│   ├── cashfree-client.ts                   # Cashfree v3 JS SDK loader
│   ├── templates.ts                         # Dynamic template & app synthesis engine
│   ├── client/
│   │   ├── auth-context.tsx                 # Unified client auth with demo mode
│   │   └── firebase.ts                      # Client Firebase SDK initialization
│   └── server/
│       ├── auth.ts                          # Server auth verification
│       ├── billing.ts                       # FUP quotas & credit reservations
│       ├── errors.ts                        # Standardized API error responses
│       ├── openrouter.ts                    # Autonomous Engine streaming & sanitization
│       └── projects.ts                      # Project snapshots & persistence
└── types/
    └── index.ts                             # TypeScript interfaces & types
```

---

## Subscription & Pricing Economics (FUP)

| Tier | Price (USD) | Price (INR) | Daily Limit | Target Margin | Monthly Credits | Engine Capability |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Free** | $0/mo | ₹0 | 5 req/day | — | 30 | Aura Core Synthesis (8k tokens) |
| **Starter** | $5/mo | ₹449 | 15 req/day | ~$2.00 / user | ~280 | Aura Advanced Synthesis & CRUD (12k tokens) |
| **Creator** | $15/mo | ₹1,329 | 60 req/day | ~$7.00 / user | ~780 | Aura Turbo Intelligence (16k tokens) |
| **Pro** | $30/mo | ₹2,649 | 200 req/day | ~$15.00 / user | ~1,560 | Aura Autonomous Studio Max (24k tokens) |

---

## Cashfree Production Webhook

Set the Webhook URL in your Cashfree Merchant Dashboard to:
`https://your-domain.com/api/payments/cashfree/webhook`
Events supported: `ORDER_PAID`, `PAYMENT_SUCCESS_WEBHOOK`.

---

## License

MIT © 2026 Aura Studio. All rights reserved.
