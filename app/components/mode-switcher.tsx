"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getCurrentMode, setCurrentMode } from "@/lib/data-store"

export default function ModeSwitcher() {
  const [mode, setMode] = useState<"hirer" | "talent">("hirer")

  useEffect(() => {
    setMode(getCurrentMode())
  }, [])

  const handleModeChange = (newMode: "hirer" | "talent") => {
    setMode(newMode)
    setCurrentMode(newMode)
    // Refresh the page to update the UI
    window.location.reload()
  }

  return (
    <div className="flex items-center bg-gray-100 rounded-full p-1">
      <Button
        onClick={() => handleModeChange("hirer")}
        variant="ghost"
        className={`px-3 py-1 text-xs rounded-full transition-colors ${
          mode === "hirer"
            ? "bg-black text-white hover:bg-black/90"
            : "text-gray-600 hover:text-gray-900 hover:bg-transparent"
        }`}
      >
        Hirer
      </Button>
      <Button
        onClick={() => handleModeChange("talent")}
        variant="ghost"
        className={`px-3 py-1 text-xs rounded-full transition-colors ${
          mode === "talent"
            ? "bg-black text-white hover:bg-black/90"
            : "text-gray-600 hover:text-gray-900 hover:bg-transparent"
        }`}
      >
        Talent
      </Button>
    </div>
  )
}
