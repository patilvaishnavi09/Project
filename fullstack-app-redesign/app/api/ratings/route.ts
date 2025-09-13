import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { ratingQueries, storeQueries } from "@/lib/database"

// POST /api/ratings - Create or update a rating
export const POST = withAuth(async (request) => {
  try {
    const { store_id, rating, comment } = await request.json()

    // Validate input
    if (!store_id || !rating) {
      return NextResponse.json({ error: "Store ID and rating are required" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Check if store exists
    const store = await storeQueries.findById(store_id)
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Check if store is active
    if (!store.is_active) {
      return NextResponse.json({ error: "Cannot rate inactive store" }, { status: 400 })
    }

    // Prevent store owners from rating their own stores
    if (store.owner_id === request.user!.id) {
      return NextResponse.json({ error: "Cannot rate your own store" }, { status: 400 })
    }

    // Create or update rating
    const newRating = await ratingQueries.create({
      store_id,
      user_id: request.user!.id,
      rating,
      comment: comment || null,
    })

    return NextResponse.json(
      {
        rating: newRating,
        message: "Rating submitted successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create rating error:", error)
    return NextResponse.json({ error: "Failed to submit rating" }, { status: 500 })
  }
})
