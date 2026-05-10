WHAT IS PayAPI?
PayAPI is a crypto-powered API payment gateway inspired by the ideas behind x402 systems.

It allows humans and AI agents to pay for API services using crypto (Stellar) and gain access to those services through scoped API keys.

Instead of traditional subscriptions, PayAPI enables pay-to-access API usage using blockchain transactions.

WHAT PROBLEM DOES PayAPI SOLVE?
Most APIs today require:
- Credit cards
- Monthly subscriptions
- Manual billing setup
- User interaction before payment

This creates problems for:
- AI agents that need autonomous payments
- Developers in regions with limited payment options
- API providers that want crypto-native monetization
- Small usage scenarios where subscriptions are unnecessary

PayAPI solves this by allowing users or AI agents to:
- Pay for a service using Stellar
- Submit the transaction hash
- Verify the payment
- Receive an API key for the purchased service
- Start making API requests immediately

CORE FEATURES
- Crypto-based API payments using Stellar
- Service-scoped API keys
- API gateway protection
- Transaction verification
- Rate limiting
- Usage tracking
- Multi-service support
- AI-agent compatible payment flow

SYSTEM ARCHITECTURE
PayAPI is built around 4 core concepts:

Payment → Verification → API Key Generation → API Access

HOW PayAPI WORKS:
Step 1 — User Selects a Service
The user or AI agent chooses the API service they want access to.
Examples:
- Crypto Price API
- News API
- Weather API

Step 2 — User Pays Using Stellar
The user sends crypto payment to the PayAPI wallet address.

After payment, the blockchain generates a transaction hash (txHash).
Example:
7f9c2ab34d...

Step 3 — Verify Payment
The client sends:
{
  "walletAddress": "GXXXX...",
  "txHash": "7f9c2ab34d...",
  "service": "crypto-price"
}

to:
POST /verify-payment

Step 4 — Backend Verifies Transaction
PayAPI checks:
- Transaction hash format
- Transaction uniqueness
- Payment validity
- Requested service

If valid:
- The transaction is stored
- An API key is generated (or reused if one already exists for that service)

Step 5 — API Key Issued
The user receives a service-scoped API key.
Example:
sk_live_xxxxxxxxx

Each API key is tied to:
- One user
- One service
- Usage limits
- Rate limits

Step 6 — Access API Services
Users include their API key in requests:
GET /api/crypto-price
x-api-key: sk_live_xxxxxxxxx

The PayAPI gateway then:
- Validates the API key
- Checks service permissions
- Enforces rate limits
- Tracks usage
- Returns the requested data

SYSTEM FLOW:
User/AI Agent
    ↓
Pays with Stellar
    ↓
Gets txHash
    ↓
POST /verify-payment
    ↓
PayAPI verifies payment
    ↓
API key generated
    ↓
User accesses API endpoints

API ENDPOINTS:
Verify Payment
POST /verify-payment
Request Body
{
  "walletAddress": "GXXXX...",
  "txHash": "abcd1234...",
  "service": "crypto-price"
}
Response
{
  "success": true,
  "apiKey": "sk_live_xxxxx",
  "service": "crypto-price"
}

ACCESS PROTECTED API:
GET /payapi/ai-search?crypto=bitcoin
Headers
x-api-key: sk_live_xxxxx

GET /payapi/news?q=bitcoin
Headers
x-api-key: sk_live_xxxxx

GET /payapi/ai-search?q=bitcoin
Headers
x-api-key: sk_live_xxxxx

Get All API Keys
GET /auth/keys
Headers
x-wallet-address: GXXXX...

Get All API key Usage
GET /auth/activity
Headers
x-wallet-address: GXXXX...

Revoke API key
POST /auth/keys/revoke
Request Body
{
  "walletAddress": "GXXXX...",
  "service": "crypto-price"
}
Response
{
    success: true,
    message: Access to Crypto API has been revoked successfully.,
}

SECURITY PRINCIPLES
1. Transaction Hash Uniqueness
A transaction hash can only be used once.
One txHash = One valid payment record

2. API Keys Are the Trust Layer
The gateway trusts only the API key.
Not:
wallet address
frontend state
txHash after verification

3. Service-Scoped API Keys
Each API key only works for the service it was created for.
Example:
Crypto API key ≠ News API access

4. Rate Limiting
Every API key has usage restrictions to protect the system from abuse.

Example:
100 requests/day

Database Structure
Users
Stores wallet-based identities:
- walletAddress
- createdAt

Stores service-scoped API keys:
- userId
- service
- keyHash
- status
- limits
- usage
- createdAt
- Transactions

Stores verified payment records:
- txHash
- userId
- service
- status
- createdAt
- UsageLogs

Stores API usage records:
- apiKeyId
- endpoint
- timestamp

AI AGENT USE CASE:
PayAPI is designed to support autonomous AI systems.

An AI agent can:
- Detect it needs a service
- Pay using Stellar
- Verify payment automatically
- Receive API access
- Continue execution without human involvement

This enables machine-to-machine payments and autonomous service access.

CURRENT MVP SCOPE:
The MVP intentionally keeps the system simple.

Included:
- Payment verification
- API key generation
- Service access control
- Rate limiting
- CoinGecko-backed endpoints
- Newsapi.org backed endpoints
- DuckDuckGo backed endpoints

Not included yet:
- Real-time blockchain listeners
- Subscription plans
- Advanced billing
- Usage-based invoicing
- Per-request payments
- Multi-chain support

Tech Stack
Backend:
- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose

Blockchain:
Stellar

External Data Provider:
- CoinGecko API
- Newsapi.org
- DuckDuckGo

PROJECT GOAL:
The goal of PayAPI is to make APIs programmable, crypto-native, and accessible to both humans and autonomous AI agents without relying on traditional subscription systems.