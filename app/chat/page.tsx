"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import {
  MapPin,
  Star,
  ContactRound,
  Import,
  Send,
  ChevronUp,
  ChevronDown,
  Search,
  CalendarIcon,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { getTalents, type Talent, getJobs, getJobById } from "@/lib/data-store"
import TopNav from "@/app/components/top-nav"
import { toast } from "sonner"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ContactRow = {
  id: string
  name: string
  location: string
  role: string
  rating: number
  daysAgo: number
  lastMessage: string
  avatar?: string
  isOnline?: boolean
  arrowSelection?: "up" | "down" | null // Added arrow selection state
}

const cities = ["Milan, Italy", "Rome, Italy", "Florence, Italy", "Venice, Italy", "Naples, Italy", "Turin, Italy"]
const rolesList = ["Hair Stylist", "Make-up Artist", "Photographer", "Fashion Designer", "Model", "Stylist"]

const makeRowsFromTalents = (talents: Talent[]): ContactRow[] => {
  const samples = [
    "Great working with you on the last project!",
    "Available for upcoming shoots",
    "Excellent collaboration as always",
    "Looking forward to our next project",
    "Ready for new opportunities",
  ]
  return talents.slice(0, 12).map((t, i) => ({
    id: t.id,
    name: t.name,
    location: t.location,
    role: t.role.replace(/-/g, " "),
    rating: t.rating ?? 4.6 + (i % 5) * 0.1,
    daysAgo: 5 + (i % 4) * 2,
    lastMessage: samples[i % samples.length],
    avatar: t.avatar,
    isOnline: new Date(t.availability.endDate) > new Date(),
    arrowSelection: null, // Initialize arrow selection
  }))
}

type DateRange = { from?: Date; to?: Date }

const formatDate = (date: Date) => {
  const d = date.getDate().toString().padStart(2, "0")
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  return `${d}/${m}`
}
const formatDateRange = (dateRange: DateRange) => {
  if (dateRange?.from && dateRange?.to) return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
  if (dateRange?.from) return `${formatDate(dateRange.from)} - Select end`
  return "Select dates"
}

export default function ChatPage() {
  const router = useRouter()
  const [hasImportedContacts, setHasImportedContacts] = useState(false)
  const [contacts, setContacts] = useState<ContactRow[]>([])
  const [jobs, setJobs] = useState<any[]>([])

  // Filters (match Browse page layout: location, dates, roles)
  const [location, setLocation] = useState("")
  const [role, setRole] = useState("")
  const [query, setQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange>({})
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [filteredCities, setFilteredCities] = useState<string[]>([])
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false)
  const [filteredRoles, setFilteredRoles] = useState<string[]>([])

  const cityInputRef = useRef<HTMLDivElement>(null)
  const roleInputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0) // Scroll to top when page loads
    setJobs(getJobs())
  }, [])

  const nonRegisteredCount = useMemo(() => Math.ceil(contacts.length / 2), [contacts])

  const simulateImportContacts = () => {
    const rows = makeRowsFromTalents(getTalents())
    setContacts(rows)
    setHasImportedContacts(true)
    toast.success(`Imported ${rows.length} contacts`)
  }

  // Prevent body scroll when the full-screen import card is shown
  useEffect(() => {
    if (!hasImportedContacts) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [hasImportedContacts])

  const handleArrowClick = (id: string, direction: "up" | "down") => {
    setContacts((prev) => {
      return prev.map((contact) => {
        if (contact.id === id) {
          // Toggle selection: if already selected, deselect; otherwise select
          const newSelection = contact.arrowSelection === direction ? null : direction
          return { ...contact, arrowSelection: newSelection }
        }
        return contact
      })
    })
  }

  // Filtering logic (query, location, role); dateRange not applied to mock data
  const filteredContacts = useMemo(() => {
    const filtered = contacts.filter((c) => {
      const matchQuery =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(query.toLowerCase())
      const matchLocation = !location || c.location.toLowerCase().includes(location.toLowerCase())
      const matchRole = !role || c.role.toLowerCase().includes(role.toLowerCase())
      return matchQuery && matchLocation && matchRole
    })

    return filtered.sort((a, b) => {
      if (a.arrowSelection === "up" && b.arrowSelection !== "up") return -1
      if (b.arrowSelection === "up" && a.arrowSelection !== "up") return 1
      if (a.arrowSelection === "down" && b.arrowSelection !== "down") return 1
      if (b.arrowSelection === "down" && a.arrowSelection !== "down") return -1
      return 0
    })
  }, [contacts, query, location, role])

  const ContactRowItem = ({ c }: { c: ContactRow }) => {
    const initials = c.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)

    return (
      <div className="grid grid-cols-[auto_1fr_auto] items-center px-4 py-3 min-h-[72px]">
        {/* Avatar */}
        <div className="relative mr-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={c.avatar || "/placeholder.svg"} alt={`${c.name} avatar`} />
            <AvatarFallback className="bg-gray-200 text-gray-700">{initials}</AvatarFallback>
          </Avatar>
          {c.isOnline && (
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
          )}
        </div>

        {/* Text */}
        <button
          className="text-left min-w-0 self-stretch flex flex-col justify-center"
          onClick={() => router.push(`/chat/${c.id}`)}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate leading-tight">{c.name}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{c.location}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-xs text-gray-600">{c.role}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span>{c.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-gray-500">
              {">"} {c.daysAgo} days
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate mt-0.5 leading-snug">{c.lastMessage}</p>
        </button>

        <div className="ml-3 self-stretch flex flex-col items-center justify-center gap-1">
          <button
            type="button"
            className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center ${
              c.arrowSelection === "up" ? "bg-black border-black" : "bg-white"
            }`}
            aria-label="Move to top"
            onClick={(e) => {
              e.stopPropagation()
              handleArrowClick(c.id, "up")
            }}
          >
            <ChevronUp className={`w-4 h-4 ${c.arrowSelection === "up" ? "text-white" : "text-gray-700"}`} />
          </button>
          <button
            type="button"
            className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center ${
              c.arrowSelection === "down" ? "bg-black border-black" : "bg-white"
            }`}
            aria-label="Move to bottom"
            onClick={(e) => {
              e.stopPropagation()
              handleArrowClick(c.id, "down")
            }}
          >
            <ChevronDown className={`w-4 h-4 ${c.arrowSelection === "down" ? "text-white" : "text-gray-700"}`} />
          </button>
        </div>
      </div>
    )
  }

  const handleCityChange = (value: string) => {
    setLocation(value)
    if (value.length > 0) {
      setFilteredCities(cities.filter((c) => c.toLowerCase().includes(value.toLowerCase())))
      setShowCitySuggestions(true)
    } else setShowCitySuggestions(false)
  }
  const handleRoleChange = (value: string) => {
    setRole(value)
    if (value.length > 0) {
      setFilteredRoles(rolesList.filter((r) => r.toLowerCase().includes(value.toLowerCase())))
      setShowRoleSuggestions(true)
    } else setShowRoleSuggestions(false)
  }
  const handleJobSelectForCalendar = (jobId: string) => {
    if (!jobId) {
      setDateRange({})
      return
    }
    const job = getJobById(jobId)
    if (job && job.roles.length > 0) {
      const startDates = job.roles.map((role: any) => new Date(role.startDate))
      const endDates = job.roles.map((role: any) => new Date(role.endDate))
      const from = new Date(Math.min(...startDates.map((d) => d.getTime())))
      const to = new Date(Math.max(...endDates.map((d) => d.getTime())))
      setDateRange({ from, to })
    }
  }

  const handleDone = () => {
    setIsCalendarOpen(false)
    // Apply date filter logic here
  }

  const handleClear = () => {
    setDateRange({})
    setIsCalendarOpen(false)
  }

  return (
    <div className="min-h-screen bg-white antialiased font-sans relative">
      {isCalendarOpen && <div className="fixed inset-0 bg-white z-30" />}

      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/beauty-tools-pattern-clean.png')",
          backgroundSize: "200px 200px",
          backgroundRepeat: "repeat",
          backgroundPosition: "0 0",
          opacity: 0.02,
        }}
      />

      <div className="relative z-10">
        <TopNav />

        <div className="fixed left-0 right-0 z-[55] px-4 pb-0" style={{ top: "74px" }}>
          <div className="max-w-md mx-auto">
            <div className="rounded-2xl">
              <div className="py-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-1/2 relative">
                      <div className="bg-white border-0 rounded-full px-3 py-2 h-11 flex items-center gap-2 shadow-lg">
                        <MapPin className="w-4 h-4 text-gray-700" />
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
                          className="flex-1 text-gray-900 text-sm bg-transparent outline-none min-w-0 placeholder-gray-500"
                          placeholder="City..."
                          autoComplete="off"
                        />
                      </div>
                      {showCitySuggestions && filteredCities.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-md mt-1 z-50 max-h-40 overflow-y-auto border border-gray-200">
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
                        className="text-gray-900 bg-white border-0 rounded-full px-3 py-2 h-11 w-full text-left hover:bg-gray-50 flex items-center gap-2 shadow-lg"
                        onClick={() => setIsCalendarOpen((v) => !v)}
                      >
                        <span
                          className={`flex-1 text-sm font-normal truncate ${!dateRange.from ? "text-gray-500" : ""}`}
                        >
                          {formatDateRange(dateRange)}
                        </span>
                        <CalendarIcon className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="bg-white border-0 rounded-full px-3 py-2 h-11 flex items-center gap-2 shadow-lg">
                      <User className="w-4 h-4 text-gray-700" />
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        onFocus={() => {
                          if (role.length > 0) {
                            const filtered = rolesList.filter((p) => p.toLowerCase().includes(role.toLowerCase()))
                            setFilteredRoles(filtered)
                            setShowRoleSuggestions(true)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setShowRoleSuggestions(false)
                          }
                        }}
                        className="flex-1 text-gray-900 text-sm bg-transparent outline-none placeholder-gray-500"
                        placeholder="Role..."
                        autoComplete="off"
                      />
                      <button
                        onClick={() => {
                          setShowRoleSuggestions(false)
                        }}
                        className="p-0 bg-transparent border-none"
                      >
                        <Search className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                    {showRoleSuggestions && filteredRoles.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-md mt-1 z-50 max-h-40 overflow-y-auto border border-gray-200">
                        {filteredRoles.map((r, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setRole(r)
                              setShowRoleSuggestions(false)
                            }}
                            className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isCalendarOpen && (
                    <div className="pt-1 relative z-40">
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-2 px-1">Quick select from your jobs:</p>
                        <Select onValueChange={handleJobSelectForCalendar} defaultValue="none">
                          <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-black rounded-full h-10 text-sm focus:ring-2 focus:ring-gray-300 focus:border-transparent">
                            <SelectValue placeholder="Select a job to autofill dates" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                            <SelectItem value="none">Clear selection</SelectItem>
                            {jobs.map((job) => (
                              <SelectItem key={job.id} value={job.id} className="hover:bg-gray-50">
                                <div className="flex flex-col">
                                  <span className="font-medium">{job.title}</span>
                                  <span className="text-xs text-gray-500">{job.location}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white">
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed left-0 right-0 z-[50] bg-transparent px-4" style={{ top: "220px" }}>
          <div className="max-w-md mx-auto">
            {!hasImportedContacts ? (
              <div className="rounded-2xl border-0 bg-white shadow-lg hover:shadow-xl transition-shadow pt-2">
                <div className="px-6 py-8 text-center">
                  <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ContactRound className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-black">Invite Your Network</h3>
                  <p className="text-sm text-gray-600 mt-1">Import your contacts to get started</p>
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={simulateImportContacts}
                      className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full flex items-center gap-2"
                    >
                      <Import className="w-4 h-4" />
                      Import Contacts
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-0 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-black text-sm">Invite Your Network</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {nonRegisteredCount} contacts are not on the platform yet
                    </p>
                  </div>
                  <Button
                    onClick={() => toast.success(`Invitations sent to ${nonRegisteredCount} contacts!`)}
                    className="bg-black hover:bg-black/90 rounded-full text-white px-4 py-2 text-xs flex items-center gap-2 border-0 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Send className="w-3 h-3" />
                    Invite All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {hasImportedContacts && (
          <div className="px-4 pb-20" style={{ paddingTop: "245px" }}>
            <div className="max-w-md mx-auto">
              {filteredContacts.length === 0 ? (
                <div className="rounded-2xl border-0 bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="px-6 py-8 text-center">
                    <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-black">No contacts found</h3>
                    <p className="text-sm text-gray-600 mt-1">Try adjusting your filters or browse new talents</p>
                    <div className="flex justify-center mt-6">
                      <Button
                        onClick={() => {
                          const params = new URLSearchParams()
                          if (location) params.set("location", location)
                          if (role) params.set("role", role)
                          if (dateRange.from) params.set("startDate", dateRange.from.toISOString())
                          if (dateRange.to) params.set("endDate", dateRange.to.toISOString())
                          router.push(`/browse?${params.toString()}`)
                        }}
                        className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        Browse Talents
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-0 bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="divide-y divide-gray-200">
                    {filteredContacts.map((c) => (
                      <ContactRowItem key={c.id} c={c} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCalendarOpen && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-md mx-auto px-4 py-4">
              <div className="flex gap-3">
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-full text-sm bg-white shadow-lg"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleDone}
                  className="flex-1 bg-black hover:bg-black/90 text-white py-3 px-4 rounded-full text-sm shadow-lg"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
