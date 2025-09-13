"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AuthGuard } from "@/components/auth-guard"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      switch (user.role) {
        case "admin":
          router.push("/admin")
          break
        case "store_owner":
          router.push("/store-owner")
          break
        case "user":
          router.push("/user")
          break
        default:
          router.push("/login")
      }
    }
  }, [user, router])

  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    </AuthGuard>
  )
}
