"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Login failed")
      } else {
        router.push("/")
      }
    } catch (err) {
      setError("Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md card p-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">Welcome back</h2>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm">Email</span>
            <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="mt-1 block w-full border rounded-lg px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm">Password</span>
            <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="mt-1 block w-full border rounded-lg px-3 py-2" />
          </label>
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Don't have an account? <Link href="/register" className="text-blue-600">Create one</Link>
        </p>
      </div>
    </div>
  )
}
