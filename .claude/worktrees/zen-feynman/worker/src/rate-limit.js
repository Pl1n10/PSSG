/**
 * Simple rate limiter: max 10 requests per IP per hour.
 * Uses Cloudflare KV if available, otherwise in-memory Map (per-isolate).
 */

const MAX_REQUESTS = 10
const WINDOW_SECONDS = 3600 // 1 hour

// In-memory fallback (resets when isolate is recycled — best effort)
const memoryStore = new Map()

const FALLBACK_SALT = 'pssg-default-salt'

/**
 * Get IP hash salt from env with safety check.
 * Warns in production if not configured, never throws.
 */
function getSalt(env) {
  if (env.IP_HASH_SALT) return env.IP_HASH_SALT

  if (env.ENVIRONMENT === 'production') {
    console.error(
      '[SECURITY] IP_HASH_SALT is not set in production. ' +
      'Using fallback salt. Set a secret with: wrangler secret put IP_HASH_SALT'
    )
  }

  return FALLBACK_SALT
}

/**
 * Hash the IP with a salt for privacy.
 */
async function hashIP(ip, salt) {
  const data = new TextEncoder().encode(`${salt}:${ip}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(hash)
  return Array.from(bytes.slice(0, 8))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Check and increment rate limit.
 * Returns { allowed: boolean, remaining: number, ipHash: string }
 */
export async function checkRateLimit(ip, env) {
  const salt = getSalt(env)
  const ipHash = await hashIP(ip, salt)
  const key = `rate:${ipHash}`

  // Try KV first
  if (env.RATE_KV) {
    try {
      const stored = await env.RATE_KV.get(key, 'json')
      const now = Math.floor(Date.now() / 1000)

      if (!stored || now - stored.start > WINDOW_SECONDS) {
        // New window
        await env.RATE_KV.put(
          key,
          JSON.stringify({ count: 1, start: now }),
          { expirationTtl: WINDOW_SECONDS }
        )
        return { allowed: true, remaining: MAX_REQUESTS - 1, ipHash }
      }

      if (stored.count >= MAX_REQUESTS) {
        return { allowed: false, remaining: 0, ipHash }
      }

      // Increment
      await env.RATE_KV.put(
        key,
        JSON.stringify({ count: stored.count + 1, start: stored.start }),
        { expirationTtl: WINDOW_SECONDS - (now - stored.start) }
      )
      return { allowed: true, remaining: MAX_REQUESTS - stored.count - 1, ipHash }
    } catch (e) {
      // KV error — fall through to memory
      console.error('KV rate limit error, using memory fallback:', e.message)
    }
  }

  // In-memory fallback
  const now = Math.floor(Date.now() / 1000)
  const entry = memoryStore.get(key)

  if (!entry || now - entry.start > WINDOW_SECONDS) {
    memoryStore.set(key, { count: 1, start: now })
    return { allowed: true, remaining: MAX_REQUESTS - 1, ipHash }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, ipHash }
  }

  entry.count++
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, ipHash }
}
