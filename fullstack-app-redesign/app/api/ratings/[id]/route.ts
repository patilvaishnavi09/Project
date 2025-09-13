import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { getDatabase } from "@/lib/database"

// GET /api/ratings/[id] - Get specific rating
export const GET = withAuth(async (request, { params }) => {
  try {
    const { id } = await params
    const ratingId = Number.parseInt(id)

    if (isNaN(ratingId)) {
      return NextResponse.json({ error: "Invalid rating ID" }, { status: 400 })
    }

    const db = getDatabase()
    const rating = db
      .prepare(`
      SELECT r.*, u.username, s.name as store_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE r.id = ?
    `)
      .get(ratingId) as
      | {
          id: number
          store_id: number
          user_id: number
          rating: number
          comment: string | null
          created_at: string
          username: string
          store_name: string
        }
      | undefined

    if (!rating) {
      return NextResponse.json({ error: "Rating not found" }, { status: 404 })
    }

    return NextResponse.json({ rating })
  } catch (error) {
    console.error("Get rating error:", error)
    return NextResponse.json({ error: "Failed to fetch rating" }, { status: 500 })
  }
})

// PUT /api/ratings/[id] - Update rating
export const PUT = withAuth(async (request, { params }) => {
  try {
    const { id } = await params
    const ratingId = Number.parseInt(id)
    const { rating, comment } = await request.json()

    if (isNaN(ratingId)) {
      return NextResponse.json({ error: "Invalid rating ID" }, { status: 400 })
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const db = getDatabase()

    // Check if rating exists and user owns it
    const existingRating = db.prepare("SELECT * FROM ratings WHERE id = ?").get(ratingId) as
      | {
          id: number
          user_id: number
        }
      | undefined

    if (!existingRating) {
      return NextResponse.json({ error: "Rating not found" }, { status: 404 })
    }

    // Users can only update their own ratings, admins can update any
    if (request.user!.role !== "admin" && existingRating.user_id !== request.user!.id) {
      return NextResponse.json({ error: "Unauthorized to update this rating" }, { status: 403 })
    }

    // Build update query
    const updateFields = []
    const updateValues = []

    if (rating !== undefined) {
      updateFields.push("rating = ?")
      updateValues.push(rating)
    }
    if (comment !== undefined) {
      updateFields.push("comment = ?")
      updateValues.push(comment)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    updateValues.push(ratingId)

    const stmt = db.prepare(`
      UPDATE ratings 
      SET ${updateFields.join(", ")} 
      WHERE id = ?
    `)

    stmt.run(...updateValues)

    // Get updated rating
    const updatedRating = db
      .prepare(`
      SELECT r.*, u.username, s.name as store_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE r.id = ?
    `)
      .get(ratingId)

    return NextResponse.json({
      rating: updatedRating,
      message: "Rating updated successfully",
    })
  } catch (error) {
    console.error("Update rating error:", error)
    return NextResponse.json({ error: "Failed to update rating" }, { status: 500 })
  }
})

// DELETE /api/ratings/[id] - Delete rating
export const DELETE = withAuth(async (request, { params }) => {
  try {
    const { id } = await params
    const ratingId = Number.parseInt(id)

    if (isNaN(ratingId)) {
      return NextResponse.json({ error: "Invalid rating ID" }, { status: 400 })
    }

    const db = getDatabase()

    // Check if rating exists and user owns it
    const existingRating = db.prepare("SELECT * FROM ratings WHERE id = ?").get(ratingId) as
      | {
          id: number
          user_id: number
        }
      | undefined

    if (!existingRating) {
      return NextResponse.json({ error: "Rating not found" }, { status: 404 })
    }

    // Users can only delete their own ratings, admins can delete any
    if (request.user!.role !== "admin" && existingRating.user_id !== request.user!.id) {
      return NextResponse.json({ error: "Unauthorized to delete this rating" }, { status: 403 })
    }

    // Delete rating
    const stmt = db.prepare("DELETE FROM ratings WHERE id = ?")
    const result = stmt.run(ratingId)

    if (result.changes === 0) {
      return NextResponse.json({ error: "Failed to delete rating" }, { status: 500 })
    }

    return NextResponse.json({ message: "Rating deleted successfully" })
  } catch (error) {
    console.error("Delete rating error:", error)
    return NextResponse.json({ error: "Failed to delete rating" }, { status: 500 })
  }
})
