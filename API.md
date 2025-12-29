# API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

All parent API routes require Supabase authentication. Include the session cookie in requests.

## Kids Management

### List Kids
```http
GET /api/kids
```

**Response:**
```json
{
  "kids": [
    {
      "id": "clxxx",
      "name": "Alice",
      "age": 8,
      "balance": 25.50,
      "avatarUrl": "https://...",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Kid
```http
POST /api/kids
Content-Type: application/json

{
  "name": "Alice",
  "age": 8,
  "pin": "1234"
}
```

**Response:**
```json
{
  "kid": {
    "id": "clxxx",
    "name": "Alice",
    "age": 8,
    "balance": 0,
    "pin": "1234"
  }
}
```

## Kid Session (PIN Auth)

### Check Kid Session
```http
GET /api/kid-session
```

**Response:**
```json
{
  "authenticated": true,
  "kid": {
    "id": "clxxx",
    "name": "Alice",
    "balance": 25.50
  }
}
```

### Create Kid Session
```http
POST /api/kid-session
Content-Type: application/json

{
  "kidId": "clxxx",
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "session-xyz",
  "kid": {
    "id": "clxxx",
    "name": "Alice",
    "balance": 25.50
  }
}
```

**Error (401):**
```json
{
  "error": "Invalid PIN"
}
```

### End Kid Session
```http
DELETE /api/kid-session
```

**Response:**
```json
{
  "success": true
}
```

## Transactions

### List Transactions
```http
GET /api/transactions?kidId=clxxx
```

**Query Parameters:**
- `kidId` (optional): Filter by kid

**Response:**
```json
{
  "transactions": [
    {
      "id": "txn_xxx",
      "type": "CHORE",
      "amount": 5.00,
      "description": "Cleaned room",
      "status": "APPROVED",
      "kidId": "clxxx",
      "kid": {
        "name": "Alice"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Transaction
```http
POST /api/transactions
Content-Type: application/json

{
  "kidId": "clxxx",
  "type": "CHORE",
  "amount": 5.00,
  "description": "Cleaned room",
  "category": "household"
}
```

**Transaction Types:**
- `CHORE` - Earned money from completing chore
- `ALLOWANCE` - Regular allowance payment
- `PURCHASE` - Spent money (negative amount)
- `BONUS` - Extra reward
- `PENALTY` - Deduction (negative amount)

**Response:**
```json
{
  "transaction": {
    "id": "txn_xxx",
    "type": "CHORE",
    "amount": 5.00,
    "description": "Cleaned room",
    "status": "APPROVED"
  }
}
```

## Chat (Claude AI)

### Send Message
```http
POST /api/chat
Content-Type: application/json

{
  "message": "What is compound interest?",
  "kidId": "clxxx",
  "sessionId": "session-123"
}
```

**Parameters:**
- `message` (required): The user's message
- `kidId` (optional): If provided, responses are kid-friendly and age-appropriate
- `sessionId` (optional): To continue a conversation thread

**Response:**
```json
{
  "response": "Compound interest is when you earn interest on your money, and then you earn interest on that interest too! It's like a snowball rolling down a hill - it gets bigger and bigger.",
  "sessionId": "session-123"
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": [] // Optional validation errors
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limits

Not implemented yet. Consider adding:
- Rate limiting on PIN attempts (prevent brute force)
- Rate limiting on API calls per user
- Rate limiting on Claude AI calls (can be expensive)

## WebSocket Events (Future)

For real-time updates, consider implementing WebSocket events:

- `transaction:created` - New transaction added
- `balance:updated` - Kid balance changed
- `reward:claimed` - Kid claimed a reward
- `kid:session:started` - Kid logged in
- `kid:session:ended` - Kid logged out

## Webhooks (Future)

Implement webhooks for:
- Scheduled allowance payments (use Upstash QStash)
- Transaction reminders
- Savings goal milestones
- Birthday bonuses
