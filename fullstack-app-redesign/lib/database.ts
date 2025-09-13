// In-memory database store
let users: User[] = []
let stores: Store[] = []
let ratings: Rating[] = []
let initialized = false

export interface User {
  id: number
  username: string
  email: string
  password_hash: string
  role: "admin" | "user" | "store_owner"
  address?: string
  created_at: string
  updated_at: string
}

export interface Store {
  id: number
  name: string
  description: string
  owner_id: number
  location: string
  phone: string
  email: string
  website?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Rating {
  id: number
  store_id: number
  user_id: number
  rating: number
  comment?: string
  created_at: string
}

// Initialize database with seed data
async function initializeDatabase() {
  if (initialized) return

  console.log("Initializing in-memory database...")

  const { hashPassword } = await import("./auth")

  // Seed users
  users = [
    {
      id: 1,
      username: "admin",
      email: "admin@example.com",
      password_hash: await hashPassword("admin123"),
      role: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      username: "john_doe",
      email: "john@example.com",
      password_hash: await hashPassword("user123"),
      role: "user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      username: "store_owner1",
      email: "owner1@example.com",
      password_hash: await hashPassword("owner123"),
      role: "store_owner",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  // Seed stores
  stores = [
    {
      id: 1,
      name: "Tech Paradise",
      description: "Your one-stop shop for all tech gadgets and accessories",
      owner_id: 3,
      location: "123 Tech Street, Silicon Valley, CA",
      phone: "+1-555-0123",
      email: "contact@techparadise.com",
      website: "https://techparadise.com",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Green Garden",
      description: "Fresh organic produce and gardening supplies",
      owner_id: 3,
      location: "456 Garden Ave, Green Valley, CA",
      phone: "+1-555-0456",
      email: "info@greengarden.com",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  // Seed ratings
  ratings = [
    {
      id: 1,
      store_id: 1,
      user_id: 2,
      rating: 5,
      comment: "Excellent service and great products!",
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      store_id: 2,
      user_id: 2,
      rating: 4,
      comment: "Fresh produce, will visit again.",
      created_at: new Date().toISOString(),
    },
  ]

  initialized = true
  console.log("Database initialized with seed data")
}

export function getDatabase() {
  initializeDatabase()
  return { users, stores, ratings }
}

export const userQueries = {
  findByEmail: (email: string): User | undefined => {
    initializeDatabase()
    return users.find((user) => user.email === email)
  },

  findById: (id: number): User | undefined => {
    initializeDatabase()
    return users.find((user) => user.id === id)
  },

  create: (userData: Omit<User, "id" | "created_at" | "updated_at">): User => {
    initializeDatabase()
    const newUser: User = {
      ...userData,
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    users.push(newUser)
    return newUser
  },

  getAll: (): User[] => {
    initializeDatabase()
    return [...users].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  update: (id: number, updates: Partial<Omit<User, "id" | "created_at">>): User | undefined => {
    initializeDatabase()
    const userIndex = users.findIndex((user) => user.id === id)
    if (userIndex === -1) return undefined

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    return users[userIndex]
  },

  delete: (id: number): boolean => {
    initializeDatabase()
    const userIndex = users.findIndex((user) => user.id === id)
    if (userIndex === -1) return false

    users.splice(userIndex, 1)
    return true
  },
}

export const storeQueries = {
  findById: (id: number): Store | undefined => {
    initializeDatabase()
    return stores.find((store) => store.id === id)
  },

  findByOwnerId: (ownerId: number): Store[] => {
    initializeDatabase()
    return stores.filter((store) => store.owner_id === ownerId)
  },

  getAll: (): Store[] => {
    initializeDatabase()
    return stores
      .filter((store) => store.is_active)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  create: (storeData: Omit<Store, "id" | "created_at" | "updated_at">): Store => {
    initializeDatabase()
    const newStore: Store = {
      ...storeData,
      id: Math.max(...stores.map((s) => s.id), 0) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    stores.push(newStore)
    return newStore
  },

  update: (id: number, updates: Partial<Omit<Store, "id" | "created_at">>): Store | undefined => {
    initializeDatabase()
    const storeIndex = stores.findIndex((store) => store.id === id)
    if (storeIndex === -1) return undefined

    stores[storeIndex] = {
      ...stores[storeIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    return stores[storeIndex]
  },

  delete: (id: number): boolean => {
    initializeDatabase()
    const storeIndex = stores.findIndex((store) => store.id === id)
    if (storeIndex === -1) return false

    stores.splice(storeIndex, 1)
    return true
  },
}

export const ratingQueries = {
  findByStoreId: (storeId: number): Rating[] => {
    initializeDatabase()
    return ratings
      .filter((rating) => rating.store_id === storeId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  findByUserId: (userId: number): Rating[] => {
    initializeDatabase()
    return ratings
      .filter((rating) => rating.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  getAverageRating: (storeId: number): number => {
    initializeDatabase()
    const storeRatings = ratings.filter((rating) => rating.store_id === storeId)
    if (storeRatings.length === 0) return 0

    const sum = storeRatings.reduce((acc, rating) => acc + rating.rating, 0)
    return Math.round((sum / storeRatings.length) * 10) / 10
  },

  create: (ratingData: Omit<Rating, "id" | "created_at">): Rating => {
    initializeDatabase()
    // Remove existing rating from same user for same store
    const existingIndex = ratings.findIndex(
      (rating) => rating.store_id === ratingData.store_id && rating.user_id === ratingData.user_id,
    )
    if (existingIndex !== -1) {
      ratings.splice(existingIndex, 1)
    }

    const newRating: Rating = {
      ...ratingData,
      id: Math.max(...ratings.map((r) => r.id), 0) + 1,
      created_at: new Date().toISOString(),
    }
    ratings.push(newRating)
    return newRating
  },

  delete: (id: number): boolean => {
    initializeDatabase()
    const ratingIndex = ratings.findIndex((rating) => rating.id === id)
    if (ratingIndex === -1) return false

    ratings.splice(ratingIndex, 1)
    return true
  },
}
