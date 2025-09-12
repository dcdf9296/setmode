"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import TopNav from "@/app/components/top-nav"
import { getCurrentMode } from "@/lib/data-store"
import { useEffect, useState } from "react"

const topRoles = [
  { name: "Hair Stylist", count: 245, icon: "✂️" },
  { name: "Make-up Artist", count: 189, icon: "💄" },
  { name: "Photographer", count: 156, icon: "📸" },
  { name: "Fashion Designer", count: 98, icon: "👗" },
  { name: "Model", count: 87, icon: "👤" },
  { name: "Videographer", count: 76, icon: "🎥" },
  { name: "Art Director", count: 65, icon: "🎨" },
  { name: "Stylist", count: 54, icon: "👔" },
]

export default function AllRolesPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"hirer" | "talent">("hirer")

  useEffect(() => {
    const currentMode = getCurrentMode()
    setMode(currentMode)
  }, [])

  const handleRoleClick = (roleName: string) => {
    if (mode === "talent") {
      router.push(`/browse-jobs?role=${encodeURIComponent(roleName)}`)
    } else {
      router.push(`/browse?role=${encodeURIComponent(roleName)}`)
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
              {mode === "talent" ? "Jobs by Roles" : "Talents by Roles"}
            </h1>
          </div>

          <Card className="rounded-2xl border border-gray-100 bg-white shadow-lg">
            <CardContent className="p-0">
              {topRoles.map((role, index) => (
                <div key={index}>
                  <div
                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleRoleClick(role.name)}
                  >
                    <div className="text-2xl">{role.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{role.name}</h3>
                      <p className="text-xs text-gray-600">
                        {role.count} {mode === "talent" ? "jobs" : "available"}
                      </p>
                    </div>
                  </div>
                  {index < topRoles.length - 1 && <div className="border-b border-gray-200 mx-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
