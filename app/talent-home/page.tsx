"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, CalendarIcon, TrendingUp, Clock, Briefcase } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import TopNav from "@/app/components/top-nav"
import { useRouter } from "next/navigation"

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

const availableJobs = [
  { name: "Hair Stylist", count: 42, icon: "✂️" },
  { name: "Make-up Artist", count: 38, icon: "💄" },
  { name: "Photographer", count: 29, icon: "📸" },
  { name: "Fashion Designer", count: 18, icon: "👗" },
  { name: "Model", count: 15, icon: "👤" },
  { name: "Videographer", count: 12, icon: "🎥" },
  { name: "Art Director", count: 9, icon: "🎨" },
  { name: "Stylist", count: 7, icon: "👔" },
]

const latestSearches = [
  "Hair Stylist jobs in Milan",
  "Photography gigs Fashion Week",
  "Make-up Artist opportunities Rome",
  "Videographer projects Florence",
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
      const filtered = professions.filter((p) => p.toLowerCase().includes(value.toLowerCase()))
      setFilteredProfessions(filtered)
      setShowProfessionSuggestions(true)
    } else setShowProfessionSuggestions(false)
  }

  const handleSearch = () => {
    setShowProfessionSuggestions(false)
    router.push("/my-jobs")
  }

  return (
    <main className="min-h-screen bg-white relative">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/beauty-tools-pattern-clean.png')",
          backgroundSize: "200px 200px",
          backgroundRepeat: "repeat",
          backgroundPosition: "0 0",
          opacity: 0.05,
        }}
      />

      <div className="relative min-h-screen">
        <div className="relative z-10">
          <div className="fixed left-0 right-0 z-50" style={{ top: "0px" }}>
            <TopNav />

            <div className="max-w-md mx-auto px-4 pb-4 relative">
              <div className="rounded-2xl overflow-hidden">
                <div
                  className="rounded-t-2xl overflow-hidden p-6 relative"
                  style={{
                    backgroundImage: "url('/beauty-tools-pattern.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
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
                        Browse jobs by role, location and availability.
                        <br />
                        Fast. Local. Reliable.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-b-2xl p-6">
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
                      <div className="w-1/2">
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

                    <div className="relative" ref={professionInputRef}>
                      <div className="bg-gradient-to-r from-gray-50 to-white shadow-inner border border-gray-100 rounded-full px-3 py-2 h-11 flex items-center gap-2 relative pr-20">
                        <Briefcase className="w-4 h-4 text-black" />
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
                          placeholder="Browse jobs and opportunities..."
                          autoComplete="off"
                        />
                        <Button
                          onClick={handleSearch}
                          className="absolute right-1 w-16 h-9 bg-white hover:bg-gray-50 text-black border-0 rounded-full text-xs font-medium flex items-center justify-center gap-1"
                        >
                          <Briefcase className="w-3 h-3" />
                          Jobs
                        </Button>
                      </div>
                      {showProfessionSuggestions && filteredProfessions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-md mt-1 z-50 max-h-40 overflow-y-auto border border-gray-100">
                          {filteredProfessions.map((profession, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSearchQuery(profession)
                                setShowProfessionSuggestions(false)
                              }}
                              className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                            >
                              {profession}
                            </button>
                          ))}
                        </div>
                      )}
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

          <div className="max-w-md mx-auto px-4" style={{ paddingTop: "480px", paddingBottom: "140px" }}>
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-black">Explore In-Demand Jobs</h2>
                <Link href="/my-jobs" className="text-sm text-gray-700 hover:text-gray-800">
                  View all
                </Link>
              </div>
              <div
                className="flex gap-3 overflow-x-auto pb-2 bg-transparent"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {availableJobs.map((job, index) => (
                  <Card
                    key={index}
                    className="rounded-2xl border border-gray-100 bg-white cursor-pointer flex-shrink-0 w-32 mb-4"
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{job.icon}</div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{job.name}</h3>
                      <p className="text-xs text-gray-600">{job.count} jobs open</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-black">Popular Job Searches</h2>
              </div>
              <div className="space-y-2">
                {latestSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(search)
                      router.push("/my-jobs")
                    }}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-3"
                  >
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
