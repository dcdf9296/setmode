"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Briefcase, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, label: "Browse" },
  { href: "/chat", icon: MessageSquare, label: "Chat" },
  { href: "/my-jobs", icon: Briefcase, label: "My Jobs" },
  { href: "/profile", icon: User, label: "Profile" },
]

export default function BottomNavBar() {
  const pathname = usePathname()

  if (pathname === "/register") {
    return null
  }

  // Do not render nav bar on the individual chat message page
  if (pathname.startsWith("/chat/") && pathname.split("/").length > 2) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white z-[60] shadow-lg backdrop-blur-sm">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors w-16",
                isActive ? "text-black" : "text-gray-500 hover:text-black",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
