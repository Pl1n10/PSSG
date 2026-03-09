/**
 * CORS headers helper.
 * Allows only the configured ALLOWED_ORIGIN (or localhost in dev).
 */

/**
 * Parse allowed origins from env into a Set.
 * Always includes http://localhost:3000.
 */
export function getAllowedOrigins(env) {
  const allowed = env.ALLOWED_ORIGIN || 'http://localhost:3000'
  const list = allowed.split(',').map((o) => o.trim()).filter(Boolean)

  if (!list.includes('http://localhost:3000')) {
    list.push('http://localhost:3000')
  }

  return new Set(list)
}

/**
 * Check if a request Origin is allowed.
 * Returns true if:
 *  - Origin header is absent (curl/Postman/server-to-server)
 *  - Origin is in the allowed set
 */
export function isOriginAllowed(request, env) {
  const origin = request.headers.get('Origin')
  if (!origin) return true // no Origin → allow (curl, Postman, etc.)
  return getAllowedOrigins(env).has(origin)
}

export function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin') || ''
  const allowedSet = getAllowedOrigins(env)

  return {
    'Access-Control-Allow-Origin': allowedSet.has(origin) ? origin : [...allowedSet][0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

export function handleOptions(request, env) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request, env),
  })
}
