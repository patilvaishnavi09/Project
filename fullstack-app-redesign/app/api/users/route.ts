import { NextResponse } from "next/server"
import { withRole } from "@/lib/middleware"
import { userQueries } from "@/lib/database"

// GET /api/users - Get all users (Admin only)
export const GET = withRole(["admin"])(async (request) => {
  try {
    const users = userQueries.getAll()

    // Remove password hashes from response
    const safeUsers = users.map(({ password_hash, ...user }) => user)

    return NextResponse.json({ users: safeUsers })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
})
