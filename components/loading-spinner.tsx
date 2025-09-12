"use client"

import { useEffect, useState } from "react"

interface LoadingSpinnerProps {
  className?: string
}

export default function LoadingSpinner({ className = "" }: LoadingSpinnerProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible((prev) => !prev)
    }, 800) // Toggle every 800ms for smooth appearing/disappearing effect

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
        <img src="/logo-w-default.png" alt="Loading..." className="w-16 h-16 animate-pulse" />
      </div>
    </div>
  )
}
