import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portfolio",
  description: "View portfolio item",
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
