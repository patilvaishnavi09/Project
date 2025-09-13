import { NextResponse } from "next/server"
import { withRole } from "@/lib/middleware"
import { getDatabase } from "@/lib/database"

// GET /api/stores/stats - Get store statistics (Admin only)
export const GET = withRole(["admin"])(async (request) => {
  try {
    const db = getDatabase()

    // Get total store count
    const totalStores = db.prepare("SELECT COUNT(*) as count FROM stores").get() as { count: number }

    // Get active store count
    const activeStores = db.prepare("SELECT COUNT(*) as count FROM stores WHERE is_active = true").get() as {
      count: number
    }

    // Get stores created in last 30 days
    const recentStores = db
      .prepare(`
      SELECT COUNT(*) as count 
      FROM stores 
      WHERE created_at >= datetime('now', '-30 days')
    `)
      .get() as { count: number }

    // Get stores by owner (top 10)
    const storesByOwner = db
      .prepare(`
      SELECT u.username, u.email, COUNT(s.id) as store_count
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      WHERE u.role = 'store_owner'
      GROUP BY u.id, u.username, u.email
      ORDER BY store_count DESC
      LIMIT 10
    `)
      .all() as { username: string; email: string; store_count: number }[]

    // Get average rating across all stores
    const avgRating = db
      .prepare(`
      SELECT AVG(rating) as avg_rating 
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE s.is_active = true
    `)
      .get() as { avg_rating: number | null }

    return NextResponse.json({
      totalStores: totalStores.count,
      activeStores: activeStores.count,
      inactiveStores: totalStores.count - activeStores.count,
      recentStores: recentStores.count,
      averageRating: avgRating.avg_rating ? Number(avgRating.avg_rating.toFixed(2)) : 0,
      topStoreOwners: storesByOwner,
    })
  } catch (error) {
    console.error("Get store stats error:", error)
    return NextResponse.json({ error: "Failed to fetch store statistics" }, { status: 500 })
  }
})
