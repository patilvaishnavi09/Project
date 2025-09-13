import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { storeQueries, ratingQueries } from "@/lib/database"

// GET /api/stores/[id] - Get store by ID with ratings
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const storeId = Number.parseInt(id)

    if (isNaN(storeId)) {
      return NextResponse.json({ error: "Invalid store ID" }, { status: 400 })
    }

    const store = storeQueries.findById(storeId)
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Get store ratings and average
    const ratings = ratingQueries.findByStoreId(storeId)
    const averageRating = ratingQueries.getAverageRating(storeId)

    return NextResponse.json({
      store: {
        ...store,
        ratings,
        averageRating: Number(averageRating.toFixed(1)),
        totalRatings: ratings.length,
      },
    })
  } catch (error) {
    console.error("Get store error:", error)
    return NextResponse.json({ error: "Failed to fetch store" }, { status: 500 })
  }
}

// PUT /api/stores/[id] - Update store
export const PUT = withAuth(async (request, { params }) => {
  try {
    const { id } = params
    const storeId = Number.parseInt(id)
    const { name, description, location, phone, email, website, is_active } = await request.json()

    if (isNaN(storeId)) {
      return NextResponse.json({ error: "Invalid store ID" }, { status: 400 })
    }

    const store = storeQueries.findById(storeId)
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Check permissions: store owner can update their own store, admin can update any
    if (request.user!.role !== "admin" && store.owner_id !== request.user!.id) {
      return NextResponse.json({ error: "Unauthorized to update this store" }, { status: 403 })
    }

    // Build update query
    const updateFields = []
    const updateValues = []

    if (name !== undefined) {
      updateFields.push("name = ?")
      updateValues.push(name)
    }
    if (description !== undefined) {
      updateFields.push("description = ?")
      updateValues.push(description)
    }
    if (location !== undefined) {
      updateFields.push("location = ?")
      updateValues.push(location)
    }
    if (phone !== undefined) {
      updateFields.push("phone = ?")
      updateValues.push(phone)
    }
    if (email !== undefined) {
      updateFields.push("email = ?")
      updateValues.push(email)
    }
    if (website !== undefined) {
      updateFields.push("website = ?")
      updateValues.push(website)
    }
    // Only admins can change is_active status
    if (is_active !== undefined && request.user!.role === "admin") {
      updateFields.push("is_active = ?")
      updateValues.push(is_active)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    updateValues.push(storeId)

    const db = storeQueries.getDatabase()
    const stmt = db.prepare(`
      UPDATE stores 
      SET ${updateFields.join(", ")} 
      WHERE id = ?
    `)

    stmt.run(...updateValues)

    // Get updated store
    const updatedStore = storeQueries.findById(storeId)!

    return NextResponse.json({
      store: updatedStore,
      message: "Store updated successfully",
    })
  } catch (error) {
    console.error("Update store error:", error)
    return NextResponse.json({ error: "Failed to update store" }, { status: 500 })
  }
})

// DELETE /api/stores/[id] - Delete store
export const DELETE = withAuth(async (request, { params }) => {
  try {
    const { id } = params
    const storeId = Number.parseInt(id)

    if (isNaN(storeId)) {
      return NextResponse.json({ error: "Invalid store ID" }, { status: 400 })
    }

    const store = storeQueries.findById(storeId)
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Check permissions: store owner can delete their own store, admin can delete any
    if (request.user!.role !== "admin" && store.owner_id !== request.user!.id) {
      return NextResponse.json({ error: "Unauthorized to delete this store" }, { status: 403 })
    }

    // Delete store from database
    const db = storeQueries.getDatabase()
    const stmt = db.prepare("DELETE FROM stores WHERE id = ?")
    const result = stmt.run(storeId)

    if (result.changes === 0) {
      return NextResponse.json({ error: "Failed to delete store" }, { status: 500 })
    }

    return NextResponse.json({ message: "Store deleted successfully" })
  } catch (error) {
    console.error("Delete store error:", error)
    return NextResponse.json({ error: "Failed to delete store" }, { status: 500 })
  }
})
