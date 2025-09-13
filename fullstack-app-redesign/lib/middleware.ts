import { type NextRequest, NextResponse } from "next/server"
import { getTokenFromRequest, verifyToken } from "./auth"
import { userQueries } from "./database"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number
    email: string
    role: string
  }
}

export function withAuth(
  handler: (req: AuthenticatedRequest, context: { params: Promise<any> }) => Promise<NextResponse>,
) {
  return async (request: NextRequest, context: { params: Promise<any> }) => {
    try {
      // Get token from request
      const token = getTokenFromRequest(request)

      if (!token) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      // Verify token
      const payload = verifyToken(token)
      if (!payload) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
      }

      // Get user data
      const user = userQueries.findById(payload.userId)
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      // Add user to request
      ;(request as AuthenticatedRequest).user = {
        id: user.id,
        email: user.email,
        role: user.role,
      }

      return handler(request as AuthenticatedRequest, context)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }
  }
}

export function withRole(roles: string[]) {
  return (handler: (req: AuthenticatedRequest, context: { params: Promise<any> }) => Promise<NextResponse>) =>
    withAuth(async (request: AuthenticatedRequest, context: { params: Promise<any> }) => {
      if (!request.user || !roles.includes(request.user.role)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }

      return handler(request, context)
    })
}
