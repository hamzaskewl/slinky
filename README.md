# Slinky

Stealth payment claim links on Canton Network. Sender and claimer never learn each other's identity — privacy coiled into the Daml contract model, not patched onto the UI.

**ETHDenver 2026 — Canton Network Privacy Track**

## Prerequisites

### 1. Install Daml SDK 2.10.3

This is needed to compile the smart contracts and run the local Canton sandbox.

**Mac / Linux:**

```bash
curl -sSL https://get.daml.com/ | sh -s 2.10.3
```

**Windows:**

Download the installer from https://docs.daml.com/getting-started/installation.html

After install, make sure `daml` is on your PATH:

```bash
daml version
# Should show: SDK version: 2.10.3
```

If it says "command not found", add `~/.daml/bin` to your PATH (the installer will tell you).

### 2. Install Node.js 18+

Download from https://nodejs.org/ (LTS recommended). This comes with npm.

```bash
node --version   # Should be 18+
npm --version    # Should be 9+
```

## Quick Start

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Start the Daml sandbox + JSON API

```bash
daml start
```

This does three things:
- Compiles the Daml contracts in `daml/`
- Starts the Canton sandbox ledger
- Starts the JSON API on `http://localhost:7575`

Keep this terminal running.

### 3. Start the frontend (new terminal)

```bash
npm run dev
```

Run both of these in separate terminals, side by side would be ideal.

Opens at `http://localhost:5173`. The Vite dev server proxies `/v1` requests to the Canton JSON API at `localhost:7575`.

### 4. Try the demo

1. Open the app — you'll see the Slinky landing page
2. Click **Get Started** — sign in as **Alice (Sender)**
3. Go to **Send** — create a payment link — copy the claim URL
4. Open a new browser tab (or incognito) — paste the URL
5. Sign in as **Bob (Claimer)** — claim the payment
6. Alice sees a ClaimNotification (but never who claimed it)
7. Bob sees a ClaimReceipt (but never who sent it)

## Build for Production

```bash
npm run build
```

Output goes to `dist/`.

## Project Structure

```
slinky/
├── daml/
│   └── Slinky.daml              # Daml smart contracts (4 templates)
├── src/
│   ├── App.tsx                   # Route-based rendering
│   ├── main.tsx                  # React entry point
│   ├── index.css                 # Tailwind CSS
│   ├── lib/
│   │   ├── canton.ts             # Canton JSON API client
│   │   └── router.ts             # Hash-based routing
│   ├── components/
│   │   ├── LandingPage.tsx       # Landing/marketing page
│   │   ├── Auth.tsx              # Login (demo + custom party)
│   │   ├── Dashboard.tsx         # App shell with nav
│   │   ├── SendPage.tsx          # Create & manage payment links
│   │   ├── ClaimPage.tsx         # Claim payments via link
│   │   └── AccountTab.tsx        # Account, contracts, privacy info
│   └── contexts/
│       └── AuthContext.tsx        # Auth state & Canton party management
├── daml.yaml                     # Daml SDK config (2.10.3)
├── .env                          # Environment variables
├── vite.config.ts                # Vite config with API proxy
└── tailwind.config.js            # Tailwind with Inter font
```

## Daml Contracts

Four templates in `daml/Slinky.daml`:

| Template | Signatories | Observers | Purpose |
|---|---|---|---|
| `ClaimLink` | sender, escrow | — | Active payment link |
| `ClaimReceipt` | claimer, escrow | — | Proof of claim (no sender field) |
| `ClaimNotification` | sender, escrow | — | Sender notified of claim (no claimer field) |
| `RevokedLink` | sender, escrow | — | Cancelled link record |

## Environment Variables

In `.env`:

```
VITE_CANTON_API_URL=          # Leave empty for local dev (Vite proxy handles it)
VITE_DAML_PACKAGE_ID=...     # Set after `daml start` deploys contracts
```

To find your package ID after `daml start`:

```bash
curl -s http://localhost:7575/v1/packages -H "Authorization: Bearer eyJ..." | python -m json.tool
```

Or check the DAR file in `.daml/dist/`.
