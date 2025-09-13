import type { User } from "./database"

const JWT_SECRET = "your-secret-key-change-in-production"

export interface JWTPayload {
  userId: number
  email: string
  role: string
  exp: number
}

// Simple base64 encoding/decoding for JWT simulation
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/")
  while (str.length % 4) {
    str += "="
  }
  return atob(str)
}

// Simple JWT implementation for browser compatibility
export function generateToken(user: User): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))

  // Simple signature simulation (not cryptographically secure, for demo only)
  const signature = base64UrlEncode(JWT_SECRET + encodedHeader + encodedPayload)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = JSON.parse(base64UrlDecode(parts[1])) as JWTPayload

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    // Simple signature verification
    const expectedSignature = base64UrlEncode(JWT_SECRET + parts[0] + parts[1])
    if (parts[2] !== expectedSignature) {
      return null
    }

    return payload
  } catch (error) {
    return null
  }
}

// Simple password hashing for browser compatibility (not secure, for demo only)
export async function hashPassword(password: string): Promise<string> {
  // Simple hash simulation - in production use proper bcrypt
  const hash = btoa(JWT_SECRET + password + "salt")
  return Promise.resolve(hash)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const expectedHash = await hashPassword(password)
  return Promise.resolve(expectedHash === hash)
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("Authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return null
}
