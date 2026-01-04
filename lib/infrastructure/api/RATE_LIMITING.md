# Rate Limiting

This application includes built-in rate limiting to protect against brute force attacks and DoS attempts.

## Usage

### Basic Usage (with existing auth)

```typescript
// Just use withAuth as normal - no rate limiting
export const GET = withAuth(async (req, userId) => {
  // Your handler code
});
```

### With Rate Limiting

```typescript
import { withAuthAndRateLimit, RateLimitPresets } from '@/lib/infrastructure/api/auth-middleware';

// Use default API rate limit (60 req/minute)
export const GET = withAuthAndRateLimit(async (req, userId) => {
  // Your handler code
});

// Use custom rate limit
export const POST = withAuthAndRateLimit(
  async (req, userId) => {
    // Your handler code
  },
  RateLimitPresets.writeApi // 30 req/minute for write operations
);
```

## Available Presets

### `RateLimitPresets.auth`
- **Window:** 15 minutes
- **Max Requests:** 5
- **Use For:** Login, signup, password reset endpoints

### `RateLimitPresets.api`
- **Window:** 1 minute
- **Max Requests:** 60
- **Use For:** Standard API endpoints

### `RateLimitPresets.readApi`
- **Window:** 1 minute
- **Max Requests:** 100
- **Use For:** Read-heavy endpoints (GET requests)

### `RateLimitPresets.writeApi`
- **Window:** 1 minute
- **Max Requests:** 30
- **Use For:** Write-heavy endpoints (POST/PUT/DELETE)

## Custom Configuration

```typescript
export const POST = withAuthAndRateLimit(
  async (req, userId) => {
    // Your handler code
  },
  {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 requests per 5 minutes
  }
);
```

## Response Headers

When rate limiting is active, these headers are included:

- `X-RateLimit-Limit`: Maximum requests allowed in the window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: ISO timestamp when the limit resets

## Rate Limit Exceeded (429)

When the limit is exceeded, the API returns:

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Try again in 45 seconds.",
  "retryAfter": 45
}
```

With headers:
- `Retry-After`: Seconds until the limit resets

## Important Notes

### Production Deployment

The current implementation uses **in-memory storage**, which means:
- ✅ Works perfectly for single-server deployments
- ❌ Doesn't work across multiple servers/instances
- ❌ Resets on server restart

**For production with multiple servers, use Redis:**

```bash
npm install ioredis
```

Then update `rate-limiter.ts` to use Redis instead of `Map`.

### Recommendations

1. **Auth Endpoints:** Always use `RateLimitPresets.auth` for login/signup
2. **Write Operations:** Use `RateLimitPresets.writeApi` for POST/PUT/DELETE
3. **Read Operations:** Use `RateLimitPresets.readApi` for GET requests
4. **Monitor:** Check rate limit headers in production to adjust limits

## Example: Protecting Login Endpoint

```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RateLimitPresets } from '@/lib/infrastructure/api/rate-limiter';

export async function POST(req: NextRequest) {
  // Apply strict rate limiting to prevent brute force
  return rateLimit(RateLimitPresets.auth)(req, async () => {
    const body = await req.json();
    // ... authentication logic
  });
}
```
