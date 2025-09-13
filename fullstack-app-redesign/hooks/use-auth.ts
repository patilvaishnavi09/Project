"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"

interface User {
  id: number
  username: string
  email: string
  role: "admin" | "user" | "store_owner"
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem("auth_token")
  const response = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch user data")
  }

  return response.json()
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
  })

  // Use SWR to verify token and get user data
  const { data, error, mutate } = useSWR("/api/auth/verify", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    onError: () => {
      // Clear invalid token
      localStorage.removeItem("auth_token")
      setAuthState((prev) => ({ ...prev, user: null, token: null, isLoading: false }))
    },
  })

  useEffect(() => {
    const token = localStorage.getItem("auth_token")

    if (data?.user) {
      setAuthState({
        user: data.user,
        token,
        isLoading: false,
        error: null,
      })
    } else if (error) {
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        error: error.message,
      })
    } else if (!token) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [data, error])

  const login = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Login failed")
      }

      // Store token
      localStorage.setItem("auth_token", result.token)

      setAuthState({
        user: result.user,
        token: result.token,
        isLoading: false,
        error: null,
      })

      // Revalidate user data
      mutate()

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      setAuthState((prev) => ({ ...prev, isLoading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const register = async (username: string, email: string, password: string, role = "user") => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, role }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Registration failed")
      }

      // Store token
      localStorage.setItem("auth_token", result.token)

      setAuthState({
        user: result.user,
        token: result.token,
        isLoading: false,
        error: null,
      })

      // Revalidate user data
      mutate()

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      setAuthState((prev) => ({ ...prev, isLoading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    })
    mutate(null, false) // Clear SWR cache
  }

  return {
    ...authState,
    login,
    register,
    logout,
    isAuthenticated: !!authState.user,
    isAdmin: authState.user?.role === "admin",
    isStoreOwner: authState.user?.role === "store_owner",
    isUser: authState.user?.role === "user",
  }
}
