import { NextResponse } from "next/server"
import { withRole } from "@/lib/middleware"
import { getDatabase } from "@/lib/database"

// GET /api/users/stats - Get user statistics (Admin only)
export const GET = withRole(["admin"])(async (request) => {
  try {
    const db = getDatabase()

    // Get user counts by role
    const roleStats = db
      .prepare(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `)
      .all() as { role: string; count: number }[]

    // Get total user count
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }

    // Get recent registrations (last 30 days)
    const recentRegistrations = db
      .prepare(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= datetime('now', '-30 days')
    `)
      .get() as { count: number }

    // Get users registered today
    const todayRegistrations = db
      .prepare(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE date(created_at) = date('now')
    `)
      .get() as { count: number }

    return NextResponse.json({
      totalUsers: totalUsers.count,
      roleDistribution: roleStats,
      recentRegistrations: recentRegistrations.count,
      todayRegistrations: todayRegistrations.count,
    })
  } catch (error) {
    console.error("Get user stats error:", error)
    return NextResponse.json({ error: "Failed to fetch user statistics" }, { status: 500 })
  }
})
