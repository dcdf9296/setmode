"use client"

import { Bell, MoreVertical } from "lucide-react"
import { useRouter } from "next/navigation"
import Logo from "@/app/components/logo"
import ModeSwitcher from "@/components/mode-switcher"

/**
 * Fixed Top Navbar with a consistent 10px bottom margin across pages.
 * Header is 64px tall; spacer below ensures 10px separation to content (74px total).
 */
export default function TopNav() {
  const router = useRouter()
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-sm">
        <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            <ModeSwitcher />
            <button
              aria-label="Notifications"
              onClick={() => router.push("/notifications")}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <Bell className="w-5 h-5 text-black" />
            </button>
            <button
              aria-label="Menu"
              onClick={() => router.push("/menu")}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>
      </header>
      {/* Spacer to create a consistent 10px margin below the navbar */}
      <div aria-hidden="true" className="h-[74px]" />
    </>
  )
}
