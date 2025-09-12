import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import BottomNavBar from "@/app/components/bottom-nav-bar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FlashCrew - Talent Search App",
  description: "Find and hire the best creative talent for your projects",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="max-w-md mx-auto">
            <main
              className={`${typeof window !== "undefined" && window.location.pathname === "/register" ? "" : "pb-16"}`}
            >
              {children}
            </main>
            <BottomNavBar />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
