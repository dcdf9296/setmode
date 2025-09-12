"use client"

import { ArrowLeft, ChevronRight, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function MenuPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login") // Redirect to login page instead of register page after logout
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const items = [
    { label: "Dashboard", href: "/dashboard" }, // Added dashboard link
    { label: "Account", href: "/profile" },
    { label: "My Jobs", href: "/my-jobs" },
    { label: "Browse", href: "/browse" },
    { label: "Chat", href: "/chat" },
    { label: "Help & Support", href: "#" },
    { label: "Settings", href: "#" },
  ]

  return (
    <main className="min-h-screen bg-white">
      <header className="h-[74px] px-4 flex items-center justify-between bg-white border-b border-gray-200">
        <button onClick={() => router.back()} className="p-2 rounded-full" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <h1 className="text-lg font-semibold text-black">Menu</h1>
        <div className="w-9" />
      </header>
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="divide-y divide-gray-200 border border-gray-200 rounded-2xl overflow-hidden">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => item.href !== "#" && router.push(item.href)}
              className="w-full flex items-center justify-between px-4 py-4 bg-white hover:bg-gray-50"
            >
              <span className="text-sm text-black">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-4 py-4 bg-white hover:bg-red-50 border border-red-200 rounded-2xl transition-colors"
        >
          <span className="text-sm text-red-600 font-medium">Log Out</span>
          <LogOut className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </main>
  )
}
