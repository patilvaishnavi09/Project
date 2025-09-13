"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: "", email: "", address: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/
    if (!form.username || form.username.length < 20 || form.username.length > 60) {
      return "Name must be between 20 and 60 characters"
    }
    if (!form.email || !EMAIL_REGEX.test(form.email)) {
      return "Please enter a valid email address"
    }
    if (form.address && form.address.length > 400) {
      return "Address must be at most 400 characters"
    }
    if (!form.password || !PASSWORD_REGEX.test(form.password)) {
      return "Password must be 8-16 characters, include at least one uppercase letter and one special character"
    }
    return ""
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "user" }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Registration failed")
      } else {
        // redirect to login or dashboard
        router.push("/login")
      }
    } catch (err) {
      setError("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-md p-6 border rounded">
        <h2 className="text-xl font-semibold mb-4">Create account</h2>

        {error && <div className="mb-3 text-red-600">{error}</div>}

        <label className="block mb-2">
          <span className="text-sm">Name</span>
          <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="mt-1 block w-full" />
          <small className="text-xs text-muted-foreground">20-60 characters</small>
        </label>

        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1 block w-full" />
        </label>

        <label className="block mb-2">
          <span className="text-sm">Address</span>
          <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="mt-1 block w-full" rows={3} />
          <small className="text-xs text-muted-foreground">Max 400 characters</small>
        </label>

        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="mt-1 block w-full" />
          <small className="text-xs text-muted-foreground">8-16 chars, at least 1 uppercase and 1 special char</small>
        </label>

        <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-sky-600 text-white rounded">
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="mt-3 text-sm">
          Already have an account? <Link href="/login" className="text-blue-600">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
