import { NextResponse } from "next/server"
import { withRole } from "@/lib/middleware"
import { storeQueries } from "@/lib/database"

// GET /api/stores - Get all active stores
export async function GET() {
  try {
    const stores = storeQueries.getAll()
    return NextResponse.json({ stores })
  } catch (error) {
    console.error("Get stores error:", error)
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 })
  }
}

// POST /api/stores - Create new store (Store owners and admins only)
export const POST = withRole(["store_owner", "admin"])(async (request) => {
  try {
    const { name, description, location, phone, email, website } = await request.json()

    // Validate required fields
    if (!name || !description || !location || !phone || !email) {
      return NextResponse.json({ error: "Name, description, location, phone, and email are required" }, { status: 400 })
    }

    // For store owners, they can only create stores for themselves
    // For admins, they need to specify owner_id or it defaults to their own ID
    let ownerId = request.user!.id
    if (request.user!.role === "admin" && request.body?.owner_id) {
      ownerId = request.body.owner_id
    }

    const newStore = storeQueries.create({
      name,
      description,
      owner_id: ownerId,
      location,
      phone,
      email,
      website: website || "",
      is_active: true,
    })

    return NextResponse.json(
      {
        store: newStore,
        message: "Store created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create store error:", error)
    return NextResponse.json({ error: "Failed to create store" }, { status: 500 })
  }
})
