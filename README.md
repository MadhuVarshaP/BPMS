# BPMS — Blockchain-Based Patch Management System

BPMS distributes software patches with cryptographic integrity guarantees. Publishers upload patch files to IPFS and anchor their SHA-256 hashes on-chain; devices verify every patch against the on-chain hash before installing, so a tampered file can never be installed silently.

## How it works

1. **Publisher** uploads a patch file. The backend pins it to IPFS (Pinata) and records the file's SHA-256 hash in the `BPMS` smart contract on Base Sepolia.
2. **Device** polls for updates, downloads the patch from the IPFS gateway, recomputes the SHA-256 hash locally, and compares it with the hash stored on-chain. Install proceeds only on an exact match.
3. **Admin** governs the system: approves publisher/device access requests, registers wallets on-chain, and audits installation logs.

Every actor authenticates with a wallet address. Roles (`admin`, `publisher`, `device`) are enforced both in the backend (MongoDB) and on-chain (`authorizedPublishers` / `registeredDevices` mappings), with configurable strictness.

## Repository layout

| Path | Description |
|---|---|
| `contract/bpms.sol` | Solidity contract (`BPMS`, Solidity ^0.8.20) — patch registry, publisher/device role mappings, installation events |
| `backend/` | Express + MongoDB API — auth middleware, patch upload/IPFS pinning, chain sync, installation logging |
| `backend/device-agent/patchAgent.js` | Reference device agent that checks for updates, verifies hashes, and reports installs |
| `frontend/` | Next.js app (App Router) with wallet login (RainbowKit/wagmi) and role-based dashboards for admin, publisher, and device |

## Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)
- A deployed `BPMS` contract on Base Sepolia (chain ID 84532) and an RPC endpoint
- Pinata account for IPFS pinning (optional — placeholder keys enable a mock IPFS mode for local testing)
- WalletConnect project ID for the frontend wallet modal

## Setup

### 1. Contract

Deploy `contract/bpms.sol` (e.g. via Remix or Hardhat) to Base Sepolia and note the deployed address.

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in MONGODB_URI, RPC_URL, CONTRACT_ADDRESS, Pinata keys
npm install
npm run dev            # nodemon on http://localhost:3001
```

Key environment variables (see `.env.example` for the full list):

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `RPC_URL` | Base Sepolia RPC endpoint |
| `CONTRACT_ADDRESS` | Deployed `BPMS` contract address |
| `PINATA_API_KEY` / `PINATA_SECRET_KEY` (or `PINATA_JWT`) | IPFS pinning; placeholder values switch to mock IPFS |
| `CHAIN_ROLE_ENFORCEMENT` | `strict` = reject when on-chain role checks are unavailable; otherwise falls back to DB roles |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins |

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local   # set NEXT_PUBLIC_CONTRACT_ADDRESS and NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
npm install
npm run dev                  # http://localhost:3000
```

### 4. Device agent (optional)

Set `DEVICE_WALLET_ADDRESS` / `DEVICE_PRIVATE_KEY` in `backend/.env`, then:

```bash
node backend/device-agent/patchAgent.js
```

## API overview

All authenticated routes expect the wallet address in the `x-wallet-address` header.

- **Public** — `GET /api/public/user/role/:walletAddress`, `POST /api/public/request/publisher`, `POST /api/public/request/device`
- **Publisher** — publish patches, `GET /logs`, `GET /analytics`
- **Device** — `GET /update-check`, `GET /patches`, `POST /report`, `GET /history`, `GET /stats`
- **Admin** — manage publishers/devices/access requests, `GET /patches`, audit logs

## Testing

Automated tests use Jest in both packages:

```bash
cd backend && npm test    # hashService + auth middleware (DB and chain mocked)
cd frontend && npm test   # version comparison + patch integrity hashing
```

The suites cover the security-critical logic: SHA-256 hashing against known vectors, bytes32 hash validation, wallet auth and role gating (including on-chain enforcement and RPC-failure fallback), semver/KB-style version comparison, and hash normalization for on-chain comparison.

## Production build

```bash
cd frontend && npm run build
cd backend && npm start
```
