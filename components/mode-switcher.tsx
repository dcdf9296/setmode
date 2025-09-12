"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { getCurrentMode } from "@/lib/data-store"

export default function ModeSwitcher() {
  const [mode, setMode] = useState<"hirer" | "talent">("hirer")
  const router = useRouter()

  useEffect(() => {
    const currentMode = getCurrentMode()
    setMode(currentMode)
  }, [])

  const handleModeChange = (isTalentMode: boolean) => {
    const newMode = isTalentMode ? "talent" : "hirer"
    setMode(newMode)
    localStorage.setItem("userMode", newMode)
    // Dispatch a storage event to notify other tabs/windows
    window.dispatchEvent(new Event("storage"))
    router.push("/")
  }

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="mode-switch" className={`text-sm text-black ${mode === "hirer" ? "font-bold" : "font-normal"}`}>
        Hirer
      </Label>
      <Switch id="mode-switch" checked={mode === "talent"} onCheckedChange={handleModeChange} />
      <Label htmlFor="mode-switch" className={`text-sm text-black ${mode === "talent" ? "font-bold" : "font-normal"}`}>
        Talent
      </Label>
    </div>
  )
}
