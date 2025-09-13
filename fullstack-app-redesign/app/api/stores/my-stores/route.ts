import { NextResponse } from "next/server"
import { withRole } from "@/lib/middleware"
import { storeQueries } from "@/lib/database"

// GET /api/stores/my-stores - Get current user's stores (Store owners only)
export const GET = withRole(["store_owner", "admin"])(async (request) => {
  try {
    const stores = storeQueries.findByOwnerId(request.user!.id)
    return NextResponse.json({ stores })
  } catch (error) {
    console.error("Get my stores error:", error)
    return NextResponse.json({ error: "Failed to fetch your stores" }, { status: 500 })
  }
})
