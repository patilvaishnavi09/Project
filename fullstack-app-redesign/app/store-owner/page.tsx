"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { LogOut, StoreIcon, Plus } from "lucide-react"

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

export default function StoreOwnerDashboard() {
  const { user, logout } = useAuth()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    phone: "",
    email: "",
    website: "",
  })

  // Fetch owner's stores
  const { data: myStores, mutate: mutateStores } = useSWR("/api/stores/my-stores", fetcher)

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          name: "",
          description: "",
          location: "",
          phone: "",
          email: "",
          website: "",
        })
        setShowCreateForm(false)
        mutateStores()
      }
    } catch (error) {
      console.error("Failed to create store:", error)
    }
  }

  return (
    <AuthGuard requiredRole="store_owner">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Store Owner Dashboard</h1>
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
          {/* My Stores */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-card-foreground">My Stores</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage your stores and view customer feedback
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Store
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myStores?.stores?.map((store: any) => (
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
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>{store.phone}</p>
                        <p>{store.email}</p>
                        {store.website && <p>{store.website}</p>}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(store.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!myStores?.stores || myStores.stores.length === 0) && (
                  <div className="col-span-full text-center py-8">
                    <StoreIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">You don't have any stores yet.</p>
                    <p className="text-sm text-muted-foreground">Click "Add Store" to create your first store.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Create Store Form */}
          {showCreateForm && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Create New Store</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Add a new store to your business portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateStore} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-card-foreground">
                        Store Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-input border-border focus:ring-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-card-foreground">
                        Location *
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                        className="bg-input border-border focus:ring-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-card-foreground">
                        Phone *
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="bg-input border-border focus:ring-ring"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-card-foreground">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="bg-input border-border focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-card-foreground">
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="bg-input border-border focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-card-foreground">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      className="bg-input border-border focus:ring-ring"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Create Store
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="border-border text-card-foreground hover:bg-muted bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
