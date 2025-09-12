"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, CalendarIcon, User, Search } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import TopNav from "@/app/components/top-nav"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

type DateRange = { from?: Date; to?: Date }

const cities = [
  "Milan, Italy",
  "Rome, Italy",
  "Florence, Italy",
  "Venice, Italy",
  "Naples, Italy",
  "Turin, Italy",
  "Bologna, Italy",
  "Palermo, Italy",
]
const professions = [
  "Hair Stylist",
  "Make-up Artist",
  "Photographer",
  "Fashion Designer",
  "Model",
  "Videographer",
  "Art Director",
  "Stylist",
]

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

function formatDate(date: Date) {
  const d = date.getDate().toString().padStart(2, "0")
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  return `${d}/${m}`
}
function formatDateRange(range: DateRange) {
  if (range?.from && range?.to) return `${formatDate(range.from)} - ${formatDate(range.to)}`
  if (range?.from) return `${formatDate(range.from)} - Select end`
  return "Select dates"
}

export default function TalentHomePage() {
  const [location, setLocation] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange>({})
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [showProfessionSuggestions, setShowProfessionSuggestions] = useState(false)
  const [filteredCities, setFilteredCities] = useState<string[]>([])
  const [filteredProfessions, setFilteredProfessions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const cityInputRef = useRef<HTMLDivElement>(null)
  const professionInputRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityInputRef.current && !cityInputRef.current.contains(event.target as Node)) setShowCitySuggestions(false)
      if (professionInputRef.current && !professionInputRef.current.contains(event.target as Node))
        setShowProfessionSuggestions(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCityChange = (value: string) => {
    setLocation(value)
    if (value.length > 0) {
      const filtered = cities.filter((c) => c.toLowerCase().includes(value.toLowerCase()))
      setFilteredCities(filtered)
      setShowCitySuggestions(true)
    } else setShowCitySuggestions(false)
  }
  const handleProfessionChange = (value: string) => {
    setSearchQuery(value)
    if (value.length > 0) {
      // BUGFIX: filter using the typed value instead of stale searchQuery state
      const filtered = professions.filter((p) => p.toLowerCase().includes(value.toLowerCase()))
      setFilteredProfessions(filtered)
      setShowProfessionSuggestions(true)
    } else setShowProfessionSuggestions(false)
  }

  const handleSearch = () => {
    setShowProfessionSuggestions(false)
    setIsLoading(true)
    router.push("/browse-jobs")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white relative">
      <div className="relative">
        <TopNav />

        {/* Hero section with search */}
        <div className="max-w-md mx-auto px-4 pt-0 pb-4 relative">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <div className="rounded-t-2xl overflow-hidden p-6 relative">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "url('/photography-set-scene.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute inset-0 bg-black opacity-75"></div>
              <div className="relative z-10">
                <div className="text-center py-6">
                  <h1
                    className="text-2xl font-bold text-white mb-2"
                    style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
                  >
                    Find your next set.
                  </h1>
                  <h2
                    className="text-2xl font-bold text-white mb-3"
                    style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
                  >
                    Work more. Work wiser.
                  </h2>
                  <p className="text-sm text-white font-semibold leading-relaxed">
                    Browse by role, location and availability.
                    <br />
                    Fast. Local. Reliable.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-b-2xl p-6 relative">
              <div className="relative z-10">
                <div className="space-y-3">
                  <div className="flex">
                    <div className="w-1/2 relative" ref={cityInputRef}>
                      <div className="bg-gradient-to-r from-gray-50 to-white shadow-inner border border-gray-100 rounded-l-full px-3 py-2 h-11 flex items-center gap-2 border-r-0">
                        <MapPin className="w-4 h-4 text-black" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => handleCityChange(e.target.value)}
                          onFocus={() => {
                            if (location.length > 0) {
                              const filtered = cities.filter((c) => c.toLowerCase().includes(location.toLowerCase()))
                              setFilteredCities(filtered)
                              setShowCitySuggestions(true)
                            }
                          }}
                          className="flex-1 text-black text-sm bg-transparent outline-none min-w-0 placeholder-gray-400"
                          placeholder="City..."
                          autoComplete="off"
                        />
                      </div>
                      {showCitySuggestions && filteredCities.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-md mt-1 z-50 max-h-40 overflow-y-auto border border-gray-100">
                          {filteredCities.map((city, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setLocation(city)
                                setShowCitySuggestions(false)
                              }}
                              className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="w-1/2 relative">
                      <button
                        className="bg-gradient-to-r from-gray-50 to-white text-black shadow-inner border border-gray-100 rounded-r-full px-3 py-2 h-11 w-full text-left hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => setIsCalendarOpen((v) => !v)}
                      >
                        <span
                          className={`flex-1 text-sm font-normal truncate ${!dateRange.from ? "text-gray-400" : "text-black"}`}
                        >
                          {formatDateRange(dateRange)}
                        </span>
                        <CalendarIcon className="w-4 h-4 text-black" />
                      </button>
                    </div>
                  </div>

                  <div className="relative flex items-center" ref={professionInputRef}>
                    <div className="bg-gradient-to-r from-gray-50 to-white shadow-inner border border-gray-100 rounded-full px-3 py-2 h-11 flex items-center gap-2 flex-1 pr-12 relative">
                      <User className="w-4 h-4 text-black" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleProfessionChange(e.target.value)}
                        onFocus={() => {
                          if (searchQuery.length > 0) {
                            const filtered = professions.filter((p) =>
                              p.toLowerCase().includes(searchQuery.toLowerCase()),
                            )
                            setFilteredProfessions(filtered)
                            setShowProfessionSuggestions(true)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSearch()
                          }
                        }}
                        className="flex-1 text-black text-sm bg-transparent outline-none placeholder-gray-400"
                        placeholder="Browse jobs..."
                        autoComplete="off"
                      />
                      <Button
                        onClick={handleSearch}
                        className="absolute right-1 w-9 h-9 bg-white hover:bg-gray-50 text-black border-0 rounded-full flex items-center justify-center p-0"
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {isCalendarOpen && (
                    <div className="pt-3">
                      <div className="rounded-xl border border-gray-100 bg-white">
                        <CalendarComponent
                          mode="range"
                          defaultMonth={dateRange?.from || new Date()}
                          selected={dateRange}
                          onSelect={(range) => setDateRange(range || {})}
                          numberOfMonths={1}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          className="w-full bg-transparent p-4"
                        />
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          onClick={() => setDateRange({})}
                          className="flex-1 rounded-full bg-white border-gray-300 text-black hover:bg-gray-50"
                        >
                          Clear
                        </Button>
                        <Button
                          onClick={() => setIsCalendarOpen(false)}
                          className="flex-1 bg-black hover:bg-gray-800 rounded-full text-white"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto px-4 pb-20 overflow-y-auto">
          {/* Roles section */}
          <section className="mb-6 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">All Jobs by Roles</h2>
              <Link href="/all-roles" className="text-sm text-gray-700 hover:text-gray-800">
                View all
              </Link>
            </div>
            <div
              className="flex gap-3 overflow-x-auto pb-4 bg-transparent"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {topRoles.map((role, index) => (
                <Card
                  key={index}
                  className="rounded-2xl border border-gray-100 bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex-shrink-0 w-32"
                  onClick={() => router.push(`/browse-jobs?role=${encodeURIComponent(role.name)}`)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{role.icon}</div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{role.name}</h3>
                    <p className="text-xs text-gray-600">{role.count} available</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Locations section */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">All Jobs by Locations</h2>
              <Link href="/all-locations" className="text-sm text-gray-700 hover:text-gray-800">
                View all
              </Link>
            </div>
            <div
              className="flex gap-3 overflow-x-auto pb-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {[
                { name: "Milan", country: "Italy", icon: "🏛️", count: 156 },
                { name: "Paris", country: "France", icon: "🗼", count: 142 },
                { name: "London", country: "UK", icon: "🏰", count: 128 },
                { name: "Rome", country: "Italy", icon: "🏟️", count: 98 },
                { name: "Barcelona", country: "Spain", icon: "🏗️", count: 87 },
                { name: "Berlin", country: "Germany", icon: "🚪", count: 76 },
                { name: "Amsterdam", country: "Netherlands", icon: "🏘️", count: 65 },
                { name: "Vienna", country: "Austria", icon: "🎼", count: 54 },
              ].map((city, index) => (
                <Card
                  key={index}
                  className="rounded-2xl border border-gray-100 bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex-shrink-0 w-32"
                  onClick={() => {
                    setLocation(`${city.name}, ${city.country}`)
                    router.push("/browse-jobs")
                  }}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{city.icon}</div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{city.name}</h3>
                    <p className="text-xs text-gray-600">{city.count} talents</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
