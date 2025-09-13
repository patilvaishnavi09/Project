import { type NextRequest, NextResponse } from "next/server"
import { userQueries } from "@/lib/database"
import { hashPassword, generateToken } from "@/lib/auth"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, address = '', role = "user" } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Name length: 20-60
    if (username.length < 20 || username.length > 60) {
      return NextResponse.json({ error: "Name must be between 20 and 60 characters" }, { status: 400 })
    }

    // Address max 400 chars
    if (address && address.length > 400) {
      return NextResponse.json({ error: "Address must be at most 400 characters" }, { status: 400 })
    }

    // Email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Password policy: 8-16, at least one uppercase and one special character
    if (!PASSWORD_REGEX.test(password)) {
      return NextResponse.json({
        error: "Password must be 8-16 characters long, include at least one uppercase letter and one special character",
      }, { status: 400 })
    }

    // Validate role
    if (!["admin", "user", "store_owner"].includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 })
    }

    // Check existing user
    const existing = userQueries.findByEmail(email)
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const password_hash = await hashPassword(password)

    const newUser = userQueries.create({
      username,
      email,
      password_hash,
      role,
      address,
    })

    const { password_hash: _ph, ...userWithoutPassword } = newUser

    const token = generateToken(userWithoutPassword)

    return NextResponse.json(
      {
        user: userWithoutPassword,
        token,
        message: "Registration successful",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
