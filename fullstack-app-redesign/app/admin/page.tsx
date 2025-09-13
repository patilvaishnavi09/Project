"use client"

import { useState } from "react"
import useSWR from "swr"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/use-auth"
import { Users, Store, Star, TrendingUp, LogOut, Trash2, Edit } from "lucide-react"

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

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch statistics
  const { data: userStats } = useSWR("/api/users/stats", fetcher)
  const { data: storeStats } = useSWR("/api/stores/stats", fetcher)

  // Fetch users and stores
  const { data: usersData, mutate: mutateUsers } = useSWR("/api/users", fetcher)
  const { data: storesData, mutate: mutateStores } = useSWR("/api/stores", fetcher)

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      if (response.ok) {
        mutateUsers()
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const handleDeleteStore = async (storeId: number) => {
    if (!confirm("Are you sure you want to delete this store?")) return

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/stores/${storeId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      if (response.ok) {
        mutateStores()
      }
    } catch (error) {
      console.error("Failed to delete store:", error)
    }
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Admin Dashboard</h1>
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

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-muted">
              <TabsTrigger value="overview" className="data-[state=active]:bg-card">
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-card">
                Users
              </TabsTrigger>
              <TabsTrigger value="stores" className="data-[state=active]:bg-card">
                Stores
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">{userStats?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +{userStats?.recentRegistrations || 0} in last 30 days
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Active Stores</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">{storeStats?.activeStores || 0}</div>
                    <p className="text-xs text-muted-foreground">+{storeStats?.recentStores || 0} new this month</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Average Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">{storeStats?.averageRating || 0}</div>
                    <p className="text-xs text-muted-foreground">Across all stores</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Growth</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">+{userStats?.todayRegistrations || 0}</div>
                    <p className="text-xs text-muted-foreground">New users today</p>
                  </CardContent>
                </Card>
              </div>

              {/* Role Distribution */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">User Role Distribution</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Breakdown of users by their assigned roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {userStats?.roleDistribution?.map((role: { role: string; count: number }) => (
                      <div key={role.role} className="flex items-center gap-2">
                        <Badge
                          variant={role.role === "admin" ? "default" : "secondary"}
                          className={
                            role.role === "admin"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground"
                          }
                        >
                          {role.role.replace("_", " ")}
                        </Badge>
                        <span className="text-sm text-card-foreground">{role.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">User Management</CardTitle>
                  <CardDescription className="text-muted-foreground">Manage all users in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-card-foreground">Username</TableHead>
                        <TableHead className="text-card-foreground">Email</TableHead>
                        <TableHead className="text-card-foreground">Role</TableHead>
                        <TableHead className="text-card-foreground">Created</TableHead>
                        <TableHead className="text-card-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData?.users?.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="text-card-foreground">{user.username}</TableCell>
                          <TableCell className="text-card-foreground">{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={user.role === "admin" ? "default" : "secondary"}
                              className={
                                user.role === "admin"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-secondary-foreground"
                              }
                            >
                              {user.role.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-card-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-border text-card-foreground hover:bg-muted bg-transparent"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              {user.role !== "admin" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stores Tab */}
            <TabsContent value="stores" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Store Management</CardTitle>
                  <CardDescription className="text-muted-foreground">Manage all stores in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-card-foreground">Name</TableHead>
                        <TableHead className="text-card-foreground">Location</TableHead>
                        <TableHead className="text-card-foreground">Owner</TableHead>
                        <TableHead className="text-card-foreground">Status</TableHead>
                        <TableHead className="text-card-foreground">Created</TableHead>
                        <TableHead className="text-card-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {storesData?.stores?.map((store: any) => (
                        <TableRow key={store.id}>
                          <TableCell className="text-card-foreground">{store.name}</TableCell>
                          <TableCell className="text-card-foreground">{store.location}</TableCell>
                          <TableCell className="text-card-foreground">Owner #{store.owner_id}</TableCell>
                          <TableCell>
                            <Badge
                              variant={store.is_active ? "default" : "secondary"}
                              className={
                                store.is_active
                                  ? "bg-secondary text-secondary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {store.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-card-foreground">
                            {new Date(store.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-border text-card-foreground hover:bg-muted bg-transparent"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteStore(store.id)}
                                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
