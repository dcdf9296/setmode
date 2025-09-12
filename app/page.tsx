"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function MainPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        console.log("[v0] Checking authentication status...")

        // Only check localStorage on client side
        if (typeof window !== "undefined") {
          const session = localStorage.getItem("auth_session")
          console.log("[v0] Session:", session ? "exists" : "null")

          if (!session) {
            console.log("[v0] No session found, redirecting to login...")
            router.replace("/login")
          } else {
            console.log("[v0] User authenticated, redirecting to home-hirer")
            router.replace("/home-hirer")
          }
        } else {
          // Server side - redirect to login
          router.replace("/login")
        }
      } catch (error) {
        console.error("[v0] Auth check error:", error)
        router.replace("/login")
      } finally {
        setIsChecking(false)
      }
    }

    // Small delay to ensure client-side rendering
    const timer = setTimeout(checkAuthStatus, 100)
    return () => clearTimeout(timer)
  }, [router])

  // Show loading while checking auth status
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-primary/20 rounded-full"></div>
        </div>
      </div>
    )
  }

  return null
}
