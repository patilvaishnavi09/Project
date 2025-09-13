"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { Star, LogOut, StoreIcon } from "lucide-react"

const fetcher = async (url: string) => {
  const token = localStorage.getItem("auth_token")
  const response = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch data")
  }

  return response.json()
}

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const [selectedStore, setSelectedStore] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  // Fetch stores and user ratings
  const { data: storesData } = useSWR("/api/stores", fetcher)
  const { data: userRatings, mutate: mutateRatings } = useSWR(user ? `/api/ratings/user/${user.id}` : null, fetcher)

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStore) return

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          store_id: selectedStore.id,
          rating,
          comment,
        }),
      })

      if (response.ok) {
        setSelectedStore(null)
        setRating(5)
        setComment("")
        mutateRatings()
      }
    } catch (error) {
      console.error("Failed to submit rating:", error)
    }
  }

  return (
    <AuthGuard requiredRole="user">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">User Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.username}</p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="border-border text-card-foreground hover:bg-muted bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Available Stores */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Available Stores</CardTitle>
              <CardDescription className="text-muted-foreground">Browse and rate stores in your area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {storesData?.stores?.map((store: any) => (
                  <Card key={store.id} className="bg-muted border-border">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-card-foreground">{store.name}</CardTitle>
                          <CardDescription className="text-muted-foreground">{store.location}</CardDescription>
                        </div>
                        <StoreIcon className="h-5 w-5 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-card-foreground mb-4">{store.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          <p>{store.phone}</p>
                          <p>{store.email}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setSelectedStore(store)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          Rate Store
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rating Form */}
          {selectedStore && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Rate {selectedStore.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Share your experience with this store
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitRating} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating" className="text-card-foreground">
                      Rating
                    </Label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-1 ${star <= rating ? "text-secondary" : "text-muted-foreground"}`}
                        >
                          <Star className="h-6 w-6 fill-current" />
                        </button>
                      ))}
                      <span className="ml-2 text-card-foreground">
                        {rating} star{rating !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment" className="text-card-foreground">
                      Comment (Optional)
                    </Label>
                    <Textarea
                      id="comment"
                      placeholder="Share your thoughts about this store..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="bg-input border-border focus:ring-ring"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Submit Rating
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedStore(null)}
                      className="border-border text-card-foreground hover:bg-muted bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* My Ratings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">My Ratings</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your previous store ratings and reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRatings?.ratings?.map((rating: any) => (
                  <div key={rating.id} className="border border-border rounded-lg p-4 bg-muted">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-card-foreground">{rating.store_name}</h4>
                        <p className="text-sm text-muted-foreground">{rating.store_location}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < rating.rating ? "text-secondary fill-current" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {rating.comment && <p className="text-sm text-card-foreground mb-2">"{rating.comment}"</p>}
                    <p className="text-xs text-muted-foreground">
                      Rated on {new Date(rating.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {(!userRatings?.ratings || userRatings.ratings.length === 0) && (
                  <p className="text-muted-foreground text-center py-8">
                    You haven't rated any stores yet. Start by rating a store above!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
