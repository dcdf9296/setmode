"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import TopNav from "@/app/components/top-nav"
import { getCurrentMode } from "@/lib/data-store"
import { useEffect, useState } from "react"

const locations = [
  { name: "Milan", country: "Italy", icon: "🏛️", count: 156 },
  { name: "Paris", country: "France", icon: "🗼", count: 142 },
  { name: "London", country: "UK", icon: "🏰", count: 128 },
  { name: "Rome", country: "Italy", icon: "🏟️", count: 98 },
  { name: "Barcelona", country: "Spain", icon: "🏗️", count: 87 },
  { name: "Berlin", country: "Germany", icon: "🚪", count: 76 },
  { name: "Amsterdam", country: "Netherlands", icon: "🏘️", count: 65 },
  { name: "Vienna", country: "Austria", icon: "🎼", count: 54 },
]

export default function AllLocationsPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"hirer" | "talent">("hirer")

  useEffect(() => {
    const currentMode = getCurrentMode()
    setMode(currentMode)
  }, [])

  const handleLocationClick = (location: { name: string; country: string }) => {
    const locationString = `${location.name}, ${location.country}`
    if (mode === "talent") {
      router.push(`/browse-jobs?location=${encodeURIComponent(locationString)}`)
    } else {
      router.push(`/browse?location=${encodeURIComponent(locationString)}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/beauty-tools-pattern-clean.png')",
          backgroundSize: "200px 200px",
          backgroundRepeat: "repeat",
          backgroundPosition: "0 0",
          opacity: 0.02,
        }}
      />

      <div className="relative z-10">
        <TopNav />

        <div className="max-w-md mx-auto px-4 pt-4">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
            <h1 className="text-xl font-semibold text-black">
              {mode === "talent" ? "Jobs by Locations" : "Talents by Locations"}
            </h1>
          </div>

          <Card className="rounded-2xl border border-gray-100 bg-white shadow-lg">
            <CardContent className="p-0">
              {locations.map((location, index) => (
                <div key={index}>
                  <div
                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleLocationClick(location)}
                  >
                    <div className="text-2xl">{location.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{location.name}</h3>
                      <p className="text-xs text-gray-600">
                        {location.count} {mode === "talent" ? "jobs" : "talents"}
                      </p>
                    </div>
                  </div>
                  {index < locations.length - 1 && <div className="border-b border-gray-200 mx-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
