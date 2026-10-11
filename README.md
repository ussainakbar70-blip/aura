# Aura — Frontier Vibe-Coding Platform

![Aura Banner](/public/aura-logo.svg)

> **Aura** is a production-ready, luxury no-code / vibe-coding web studio (similar to Lovable / Emergent) where users type app prompts, select frontier models via OpenRouter (Claude 3.7 Sonnet, Opus, Gemini 2.0 Flash, GPT-4o, o1), and preview interactive applications instantly in a sandboxed runtime.

---

## Key Highlights

- **Dual-Pane Lovable Studio Aesthetic**: Sleek luxury dark mode (`#09090b`), dual-pane reactive layout with conversational prompt copilot on the left and live responsive sandbox iframe on the right.
- **Frontier Models via OpenRouter**:
  - **Anthropic**: Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus
  - **OpenAI**: GPT-4o, GPT-4o-mini, OpenAI o1
  - **Google**: Gemini 2.0 Flash, Gemini 1.5 Pro
  - **BYOK (Bring Your Own Key)**: Direct client-side key storage in Settings or server-side environment variables.
  - **Intelligent Synthesis Fallback Engine**: Works 100% offline or without API keys using built-in interactive synthesis templates.
- **Production Cashfree Payment Gateway Integration**:
  - Seamless subscription checkouts for Indian and global users.
  - Automated order creation (`/api/payments/cashfree/create-order`).
  - Cashfree v3 JS SDK Dropin modal checkout.
  - Verification API (`/api/payments/cashfree/verify`).
  - Production Webhook handler (`/api/payments/cashfree/webhook`) with HMAC SHA256 signature verification.
- **Fair Usage Policy (FUP) & Sustainable Profit Margins**:
  - **Starter Tier ($5 / month / ₹419 INR)**: 15 requests/day limit, ~$2 profit margin logic per subscriber.
  - **Mid Tier ($15 / month / ₹1,249 INR)**: 60 requests/day limit, ~$7 profit margin logic per subscriber.
  - **Pro Tier ($30 / month / ₹2,499 INR)**: 200 requests/day limit, ~$15 profit margin logic per subscriber.
  - Quota meter with 24-hour UTC reset logic and real-time upgrade alerts.
- **Multi-Viewport Interactive Sandbox**:
  - Desktop (100%), Tablet (768px), and Mobile (375px) responsive frames.
  - Hot reload, full-screen expansion, console error inspector.
- **Code Explorer & Export**:
  - Syntax-highlighted multi-file explorer (`App.tsx`, `index.html`, `styles.css`).
  - 1-click Standalone HTML download and React component clipboard copy.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Payment Gateway**: Cashfree PG API v2023-08-01 & Cashfree JS SDK v3
- **AI Gateway**: OpenRouter API
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

# OpenRouter Frontier Models
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
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
│   │   ├── generate/route.ts                # OpenRouter & synthesis engine
│   │   ├── payments/cashfree/
│   │   │   ├── create-order/route.ts        # Cashfree PG order creation
│   │   │   ├── verify/route.ts              # Cashfree payment verification
│   │   │   └── webhook/route.ts             # Webhook signature & tier update
│   │   └── usage/route.ts                   # Daily limits & FUP economics
│   ├── globals.css                          # Luxury dark tokens & scrollbars
│   ├── layout.tsx                           # App metadata & brand favicon
│   └── page.tsx                             # Main Aura dual-pane studio page
├── components/
│   ├── AuraLogo.tsx                         # Brand mark with sandal mixed background
│   ├── ChatPanel.tsx                        # Lovable copilot & model selector
│   ├── CodePanel.tsx                        # Multi-file tabbed code explorer
│   ├── ExportModal.tsx                      # Code and bundle exporter
│   ├── Navbar.tsx                           # Studio header, viewports & tier pills
│   ├── PreviewPanel.tsx                     # Live interactive sandbox iframe
│   ├── PricingModal.tsx                     # Cashfree checkout & FUP table
│   ├── SettingsModal.tsx                    # BYOK OpenRouter key & diagnostics
│   └── ShareModal.tsx                       # Live preview links & embed code
├── config/
│   ├── models.ts                            # Frontier models configuration
│   └── tiers.ts                             # Subscription tiers & economics
├── lib/
│   ├── cashfree.ts                          # Cashfree PG server client & HMAC verify
│   ├── cashfree-client.ts                   # Cashfree v3 JS SDK loader
│   └── templates.ts                         # Dynamic template & app synthesis engine
└── types/
    └── index.ts                             # TypeScript interfaces & types
```

---

## Subscription & Pricing Economics (FUP)

| Tier | Price (USD) | Price (INR) | Daily Limit | Target Profit Margin | Target Compute Allowance | Allowed Models |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Starter** | $5/mo | ₹419 | 15 req/day | ~$2.00 / user | ~$3.00 / user | Claude 3.5 Haiku, Gemini 2.0 Flash, GPT-4o-mini |
| **Mid** | $15/mo | ₹1,249 | 60 req/day | ~$7.00 / user | ~$8.00 / user | Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro |
| **Pro** | $30/mo | ₹2,499 | 200 req/day | ~$15.00 / user | ~$15.00 / user | Claude 3.7 Sonnet, Claude 3 Opus, OpenAI o1 |

---

## Cashfree Production Webhook

Set the Webhook URL in your Cashfree Merchant Dashboard to:
`https://your-domain.com/api/payments/cashfree/webhook`
Events supported: `ORDER_PAID`, `PAYMENT_SUCCESS_WEBHOOK`.

---

## License

MIT © 2026 Aura Studio. All rights reserved.
