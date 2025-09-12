"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setCurrentMode } from "@/lib/data-store"
import LoadingSpinner from "@/components/loading-spinner"

export default function BrowseJobsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setCurrentMode("talent")

    // Preserve any query parameters (role, location, etc.)
    const params = new URLSearchParams(searchParams.toString())
    const queryString = params.toString()
    const redirectUrl = queryString ? `/browse?${queryString}` : "/browse"

    router.replace(redirectUrl)
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}
