import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { getDatabase } from "@/lib/database"

// GET /api/ratings/user/[userId] - Get all ratings by a user
export const GET = withAuth(async (request, { params }) => {
  try {
    const { userId } = await params
    const userIdNum = Number.parseInt(userId)

    if (isNaN(userIdNum)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Users can only view their own ratings, admins can view any
    if (request.user!.role !== "admin" && request.user!.id !== userIdNum) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get user ratings with store information
    const db = getDatabase()
    const ratings = db
      .prepare(`
      SELECT r.*, s.name as store_name, s.location as store_location
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `)
      .all(userIdNum) as Array<{
      id: number
      store_id: number
      user_id: number
      rating: number
      comment: string | null
      created_at: string
      store_name: string
      store_location: string
    }>

    return NextResponse.json({ ratings })
  } catch (error) {
    console.error("Get user ratings error:", error)
    return NextResponse.json({ error: "Failed to fetch user ratings" }, { status: 500 })
  }
})
