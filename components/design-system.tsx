"use client"

import { useEffect, useState } from "react"

export type DesignVariant = "classic" | "elevated" | "minimal"
export const VARIANTS: DesignVariant[] = ["classic", "elevated", "minimal"]

const VARIANT_STORAGE_KEY = "design-variant"

export function useDesignVariant(defaultVariant: DesignVariant = "classic") {
  const [variant, setVariant] = useState<DesignVariant>(defaultVariant)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VARIANT_STORAGE_KEY) as DesignVariant | null
      if (stored && (VARIANTS as string[]).includes(stored)) {
        setVariant(stored)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(VARIANT_STORAGE_KEY, variant)
    } catch {
      // ignore
    }
  }, [variant])

  return { variant, setVariant }
}

export function cardClasses(variant: DesignVariant): string {
  switch (variant) {
    case "elevated":
      return "bg-white border border-gray-100 shadow-lg shadow-black/5"
    case "minimal":
      return "bg-white border border-gray-100"
    case "classic":
    default:
      return "bg-white border border-gray-200 shadow-sm"
  }
}

export function sectionTitleClasses(): string {
  return "text-base font-semibold text-gray-900"
}

export function mutedTextClasses(): string {
  return "text-xs text-gray-600"
}
