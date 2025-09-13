import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import Link from "next/link"
import "./globals.css"

export const metadata: Metadata = {
  title: "StoreHub - Business Management Platform",
  description: "A comprehensive platform for managing stores, users, and ratings with role-based access control",
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-gray-50 text-gray-900 ${GeistSans.variable} ${GeistMono.variable}`}>
        <div className="flex flex-col min-h-screen">
          <header className="bg-white border-b">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold">StoreHub</Link>
              <nav className="space-x-4">
                <Link href="/" className="text-sm hover:underline">Home</Link>
                <Link href="/register" className="text-sm hover:underline">Register</Link>
                <Link href="/login" className="text-sm hover:underline">Login</Link>
              </nav>
            </div>
          </header>

          <main className="flex-1">
            <Suspense fallback={null}>{children}</Suspense>
          </main>

          <footer className="bg-white border-t">
            <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} StoreHub — Built with ❤️
            </div>
          </footer>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
