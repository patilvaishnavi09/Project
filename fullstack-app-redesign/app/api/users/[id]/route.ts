import { NextResponse } from "next/server"
import { withRole, withAuth } from "@/lib/middleware"
import { userQueries } from "@/lib/database"

// GET /api/users/[id] - Get user by ID
export const GET = withAuth(async (request, { params }) => {
  try {
    const { id } = await params
    const userId = Number.parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Users can only view their own profile, admins can view any
    if (request.user!.role !== "admin" && request.user!.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const user = userQueries.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove password hash from response
    const { password_hash, ...safeUser } = user

    return NextResponse.json({ user: safeUser })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
})

// PUT /api/users/[id] - Update user (Admin only for role changes)
export const PUT = withAuth(async (request, { params }) => {
  try {
    const { id } = await params
    const userId = Number.parseInt(id)
    const { role, username } = await request.json()

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const user = userQueries.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check permissions
    const isOwnProfile = request.user!.id === userId
    const isAdmin = request.user!.role === "admin"

    // Only admins can change roles
    if (role && !isAdmin) {
      return NextResponse.json({ error: "Only admins can change user roles" }, { status: 403 })
    }

    // Users can only update their own username, admins can update any
    if (username && !isOwnProfile && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update user in database
    const db = userQueries.getDatabase()
    const updateFields = []
    const updateValues = []

    if (username) {
      updateFields.push("username = ?")
      updateValues.push(username)
    }

    if (role && isAdmin) {
      if (!["admin", "user", "store_owner"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
      }
      updateFields.push("role = ?")
      updateValues.push(role)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    updateValues.push(userId)

    const stmt = db.prepare(`
      UPDATE users 
      SET ${updateFields.join(", ")} 
      WHERE id = ?
    `)

    stmt.run(...updateValues)

    // Get updated user
    const updatedUser = userQueries.findById(userId)!
    const { password_hash, ...safeUser } = updatedUser

    return NextResponse.json({
      user: safeUser,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
})

// DELETE /api/users/[id] - Delete user (Admin only)
export const DELETE = withRole(["admin"])(async (request, { params }) => {
  try {
    const { id } = await params
    const userId = Number.parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Prevent admin from deleting themselves
    if (request.user!.id === userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const user = userQueries.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user from database
    const db = userQueries.getDatabase()
    const stmt = db.prepare("DELETE FROM users WHERE id = ?")
    const result = stmt.run(userId)

    if (result.changes === 0) {
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
})
