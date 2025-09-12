"use client"

import { MapPin, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Talent } from "@/lib/data-store"

export default function TalentInfoCard({ talent }: { talent: Talent }) {
  const initials = talent.name
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <div className="rounded-2xl bg-white text-black shadow-lg hover:shadow-xl transition-shadow">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 flex-shrink-0">
            <AvatarImage src={talent.avatar || "/placeholder.svg?height=64&width=64&query=avatar"} alt={talent.name} />
            <AvatarFallback className="bg-gray-200 text-gray-800">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold">{talent.name}</h2>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-xs text-gray-800">{talent.rating?.toFixed(1) ?? "—"}</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 capitalize">{talent.role.replace("-", " ")}</p>
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
              <MapPin className="h-3 w-3 text-gray-500" />
              <span>{talent.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
