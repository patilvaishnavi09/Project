"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, Star, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Store className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Store className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-card-foreground">StoreHub</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="border-border text-card-foreground hover:bg-muted bg-transparent">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Manage Your Business with <span className="text-primary">StoreHub</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            A comprehensive platform for store management, user engagement, and business growth. Connect with customers,
            manage your stores, and build your business presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-muted bg-transparent"
              >
                Sign In to Continue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">Everything You Need to Succeed</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <Store className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-card-foreground">Store Management</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Create and manage your stores with detailed information, contact details, and business hours.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <Star className="h-12 w-12 text-secondary mb-4" />
                <CardTitle className="text-card-foreground">Customer Reviews</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Build trust with customer ratings and reviews. Engage with your audience and improve your services.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-card-foreground">Role-Based Access</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Secure platform with different access levels for admins, store owners, and customers.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-foreground mb-6">Ready to Get Started?</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of businesses already using StoreHub to manage their operations and connect with customers.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              Create Your Account Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Store className="h-6 w-6 text-primary mr-2" />
            <span className="text-card-foreground font-semibold">StoreHub</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 StoreHub. Built with modern web technologies for business success.
          </p>
        </div>
      </footer>
    </div>
  )
}
