import { NextResponse } from "next/server"
import { ratingQueries, storeQueries } from "@/lib/database"

// GET /api/ratings/store/[storeId] - Get all ratings for a store
export async function GET(request: Request, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params
    const storeIdNum = Number.parseInt(storeId)

    if (isNaN(storeIdNum)) {
      return NextResponse.json({ error: "Invalid store ID" }, { status: 400 })
    }

    // Check if store exists
    const store = await storeQueries.findById(storeIdNum)
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Get ratings with user information
    const db = ratingQueries.getDatabase()
    const ratings = db
      .prepare(`
      SELECT r.*, u.username 
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `)
      .all(storeIdNum) as Array<{
      id: number
      store_id: number
      user_id: number
      rating: number
      comment: string | null
      created_at: string
      username: string
    }>

    // Get rating statistics
    const averageRating = ratingQueries.getAverageRating(storeIdNum)
    const totalRatings = ratings.length

    // Get rating distribution
    const ratingDistribution = db
      .prepare(`
      SELECT rating, COUNT(*) as count
      FROM ratings
      WHERE store_id = ?
      GROUP BY rating
      ORDER BY rating DESC
    `)
      .all(storeIdNum) as Array<{ rating: number; count: number }>

    return NextResponse.json({
      ratings,
      statistics: {
        averageRating: Number(averageRating.toFixed(1)),
        totalRatings,
        ratingDistribution,
      },
    })
  } catch (error) {
    console.error("Get store ratings error:", error)
    return NextResponse.json({ error: "Failed to fetch store ratings" }, { status: 500 })
  }
}
