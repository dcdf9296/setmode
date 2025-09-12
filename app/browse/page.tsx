"use client"

import { useState, useRef, useEffect } from "react"
import { MapPin, CalendarIcon, UserIcon, Search, Euro } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getCurrentMode } from "@/lib/data-store"
import TopNav from "@/app/components/top-nav"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

const portfolioImages = [
  "/images/feed/portfolio-sample-1.png",
  "/images/feed/portfolio-sample-2.png",
  "/images/feed/portfolio-sample-3.png",
  "/images/feed/portfolio-sample-4.png",
  "/images/feed/portfolio-sample-5.png",
  "/images/feed/portfolio-sample-6.png",
  "/images/portfolio/gucci-bloom-hairstylist.png",
  "/images/portfolio/vogue-italia-makeup.png",
  "/images/portfolio/avant-garde-hairshow.png",
  "/images/portfolio/milan-fashion-week-hair-makeup.png",
]

const jobsData = [
  { year: "2024", project: "Here After - L'aldilà", role: "Hair Stylist", producer: "Netflix Studios" },
  { year: "2024", project: "Fashion Week Milano", role: "Lead Stylist", producer: "Versace" },
  { year: "2024", project: "Versace Campaign", role: "Hair Stylist", producer: "Versace" },
  { year: "2023", project: "Vogue Photoshoot", role: "Hair Stylist", producer: "Condé Nast" },
]

const cities = ["Milan, Italy", "Rome, Italy", "Florence, Italy", "Venice, Italy", "Naples, Italy", "Turin, Italy"]
const professions = ["Hair Stylist", "Make-up Artist", "Photographer", "Fashion Designer", "Model", "Stylist"]

const formatDate = (date: Date) => {
  const d = date.getDate().toString().padStart(2, "0")
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  return `${d}/${m}`
}

interface Talent {
  id: string
  full_name: string
  email: string
  roles: string[]
  location: string
  profile_picture_url?: string
  bio?: string
  rating: number
  total_reviews: number
  is_verified: boolean
  availability?: string
}

interface Job {
  id: string
  title: string
  description?: string
  role: string
  location: string
  employment_type?: string
  budget_min?: number
  budget_max?: number
  currency: string
  status: string
  created_at: string
  deadline?: string
  hirer: {
    full_name: string
    profile_picture_url?: string
  }
}

export default function SearchTalentsFeed() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [showProfessionSuggestions, setShowProfessionSuggestions] = useState(false)
  const [filteredCities, setFilteredCities] = useState<string[]>([])
  const [filteredProfessions, setFilteredProfessions] = useState<string[]>([])
  const [mode, setMode] = useState<"hirer" | "talent">("hirer")
  const [jobs, setJobs] = useState<Job[]>([])
  const [talents, setTalents] = useState<Talent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const cityInputRef = useRef<HTMLDivElement>(null)
  const professionInputRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    window.scrollTo(0, 0)
    // Default to "hirer" so Talents are shown by default
    const currentMode = (searchParams.get("mode") || "hirer").toLowerCase() as "hirer" | "talent"
    setMode(currentMode)

    const roleParam = searchParams.get("role")
    const locationParam = searchParams.get("location")

    if (roleParam) {
      setSearchQuery(decodeURIComponent(roleParam))
    }
    if (locationParam) {
      setLocation(decodeURIComponent(locationParam))
    }

    loadData(currentMode, roleParam, locationParam)
  }, [searchParams])

  const loadData = async (currentMode: string, roleParam?: string | null, locationParam?: string | null) => {
    try {
      setIsLoading(true)

      if (currentMode === "hirer") {
        // Fetch talents via server API to avoid client-side RLS pitfalls
        const params = new URLSearchParams()
        if (roleParam) params.set("role", roleParam)
        if (locationParam) params.set("location", locationParam)
        if (dateRange?.from && dateRange?.to) {
          const fromStr = new Date(dateRange.from).toISOString().slice(0, 10)
          const toStr = new Date(dateRange.to).toISOString().slice(0, 10)
          params.set("from", fromStr)
          params.set("to", toStr)
        }

        const res = await fetch(`/api/users?${params.toString()}`, { cache: "no-store" })
        if (!res.ok) {
          throw new Error("Users API failed")
        }
        const { users } = await res.json()
        setTalents(users || [])
      } else {
        // SHOW JOBS (unchanged)
        let query = supabase
          .from("jobs")
          .select(`
            *,
            hirer:users!jobs_hirer_id_fkey(full_name, profile_picture_url)
          `)
          .eq("status", "active")
          .order("created_at", { ascending: false })

        if (roleParam) {
          query = query.eq("role", roleParam)
        }

        if (locationParam) {
          query = query.ilike("location", `%${locationParam}%`)
        }

        const { data: jobsData, error: jobsError } = await query

        if (jobsError) {
          console.error("Error loading jobs:", jobsError)
          toast.error("Failed to load jobs")
        } else {
          setJobs(jobsData || [])
        }
      }
    } catch (err) {
      console.error("Browse loadData error:", err)
      toast.error("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCityChange = (value: string) => {
    setLocation(value)
    if (value.length > 0) {
      setFilteredCities(cities.filter((c) => c.toLowerCase().includes(value.toLowerCase())))
      setShowCitySuggestions(true)
    } else setShowCitySuggestions(false)
  }

  const handleProfessionChange = (value: string) => {
    setSearchQuery(value)
    if (value.length > 0) {
      // BUGFIX: use the typed value for filtering (was using p.includes(p))
      setFilteredProfessions(professions.filter((p) => p.toLowerCase().includes(value.toLowerCase())))
      setShowProfessionSuggestions(true)
    } else setShowProfessionSuggestions(false)
  }

  const formatDateRange = () => {
    if (dateRange?.from && dateRange?.to) return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
    if (dateRange?.from) return `${formatDate(dateRange.from)} - Select end`
    return "Select dates"
  }

  const filteredTalents = talents.filter((talent) => {
    const q = searchQuery.toLowerCase().trim()
    const loc = location.toLowerCase().trim()
    const queryMatch =
      !q ||
      talent.full_name.toLowerCase().includes(q) ||
      talent.roles?.some((role) => role.toLowerCase().includes(q))
    const locationMatch = !loc || talent.location?.toLowerCase().includes(loc)
    return queryMatch && locationMatch
  })

  const TalentCard = ({ talent }: { talent: Talent }) => {
    const avatarFallback = talent.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")

    const primaryRole = talent.roles?.[0] || "Professional"

    return (
      <Card className="rounded-2xl border border-gray-100 bg-white mb-4 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-0">
          <Link href={`/talent/${talent.id}?from=browse`} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={talent.profile_picture_url || "/logo-w-default.png"}
                  alt={`${talent.full_name} avatar`}
                />
                <AvatarFallback className="bg-gray-200 text-gray-800">{avatarFallback}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{talent.full_name}</h3>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-500" />
                  {talent.location || "Location not specified"}
                </p>
              </div>
            </div>
            <p className="font-semibold text-sm text-gray-800 capitalize">{primaryRole.replace("-", " ")}</p>
          </Link>

          <Tabs defaultValue="portfolio" className="w-full">
            <TabsList
              className="flex rounded-full p-1 m-0 bg-gradient-to-r from-gray-50 to-white shadow-inner py-2 gap-0 justify-center relative h-10"
              style={{ width: "-webkit-fill-available", marginLeft: "12px", marginRight: "12px" }}
            >
              <TabsTrigger
                value="portfolio"
                className="flex-1 justify-center rounded-full text-sm font-medium flex items-center gap-2 h-8 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-500 data-[state=active]:border-0"
              >
                Portfolio
              </TabsTrigger>
              <TabsTrigger
                value="cv"
                className="flex-1 justify-center rounded-full text-sm font-medium flex items-center gap-2 h-8 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-500 data-[state=active]:border-0"
              >
                CV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="m-0 p-0 bg-white rounded-b-2xl">
              <div className="w-full overflow-hidden rounded-b-2xl">
                <div className="px-4">
                  <div
                    className="flex gap-3 py-4 overflow-x-auto scrollbar-hide"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {portfolioImages.map((src, index) => (
                      <div key={index} className="flex-shrink-0 w-28 h-28">
                        <Image
                          src={src || "/placeholder.svg"}
                          alt={`Portfolio ${index + 1}`}
                          width={112}
                          height={112}
                          className="w-full h-full object-cover rounded-lg shadow-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cv" className="m-0 p-0 bg-white rounded-b-2xl">
              <div className="w-full overflow-hidden bg-white rounded-b-2xl">
                <div className="px-4 rounded-b-2xl">
                  <div
                    className="relative overflow-x-auto overflow-y-hidden scrollbar-hide py-6"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    <div className="flex gap-2">
                      {jobsData.map((job, index) => (
                        <div key={index} className="relative flex flex-col items-center text-center min-w-0">
                          <div className="text-2xs text-gray-800 font-thin mb-1" style={{ fontSize: "10px" }}>
                            {job.year}
                          </div>

                          <div
                            className="text-2xs font-medium text-gray-900 mb-2 max-w-20 leading-tight"
                            style={{ fontSize: "10px" }}
                          >
                            {job.project}
                          </div>

                          <div className="relative flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full z-10 shadow-sm"></div>
                            {index < jobsData.length - 1 && (
                              <>
                                <div className="w-8 h-px bg-gray-600 ml-2"></div>
                                <div className="w-8 h-px border-t border-dotted border-gray-600"></div>
                              </>
                            )}
                          </div>

                          <div className="mt-2 mb-1">
                            <div
                              className="bg-gray-200 text-gray-700 px-2 py-0 rounded-full text-xs font-medium"
                              style={{ fontSize: "8px" }}
                            >
                              {job.role}
                            </div>
                          </div>

                          <div
                            className="text-2xs text-gray-800 font-thin italic max-w-20 leading-tight"
                            style={{ fontSize: "8px" }}
                          >
                            {job.producer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    )
  }

  const JobCard = ({ job }: { job: Job }) => {
    const formatJobDate = (dateString: string) => {
      const date = new Date(dateString)
      const d = date.getDate().toString().padStart(2, "0")
      const m = (date.getMonth() + 1).toString().padStart(2, "0")
      return `${d}/${m}`
    }

    const createdDate = formatJobDate(job.created_at)
    const deadlineDate = job.deadline ? formatJobDate(job.deadline) : null

    return (
      <Card className="rounded-2xl border border-gray-100 bg-white mb-4 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{job.title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <MapPin className="w-3 h-3" />
                <span>{job.location}</span>
              </div>
              <div className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium inline-block">
                {deadlineDate ? `Deadline: ${deadlineDate}` : `Posted: ${createdDate}`}
              </div>
            </div>
            {job.hirer && (
              <div className="flex flex-col items-end gap-1">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={job.hirer.profile_picture_url || "/logo-w-default.png"}
                    alt={`${job.hirer.full_name} avatar`}
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-800 text-xs">
                    {job.hirer.full_name
                      .split(" ")
                      .map((n: any) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Posted by</p>
                  <p className="text-xs font-medium text-gray-900">{job.hirer.full_name}</p>
                </div>
              </div>
            )}
          </div>
          <div className="border border-gray-100 rounded-lg p-2">
            <p className="text-sm font-medium capitalize text-gray-900">{job.role.replace("-", " ")}</p>
            {(job.budget_min || job.budget_max) && (
              <p className="text-xs text-gray-600">
                <Euro className="inline w-3 h-3 mr-1" />
                {job.budget_min && job.budget_max
                  ? `${job.budget_min}-${job.budget_max}`
                  : job.budget_min || job.budget_max}
                <span className="text-gray-500">/{job.currency || "EUR"}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white antialiased font-sans relative">
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
          <div className="max-w-md mx-auto px-4 pt-32">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white antialiased font-sans relative">
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

        <div className="fixed left-0 right-0 z-[55] bg-transparent rounded-b-2xl" style={{ top: "74px" }}>
          <div className="max-w-md mx-auto px-4 pb-4">
            <div className="space-y-3">
              <div className="flex">
                <div className="w-1/2 relative" ref={cityInputRef}>
                  <div className="bg-white border border-gray-100 rounded-l-full px-3 py-2 h-11 flex items-center gap-2 border-r-0 shadow-lg">
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
                    className="bg-white text-gray-900 border border-gray-100 rounded-r-full px-3 py-2 h-11 w-full text-left hover:bg-gray-50 flex items-center gap-2 shadow-lg"
                    onClick={() => setIsCalendarOpen((v) => !v)}
                  >
                    <span className={`flex-1 text-sm font-normal truncate ${!dateRange.from ? "text-gray-500" : ""}`}>
                      {formatDateRange()}
                    </span>
                    <CalendarIcon className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>

              <div className="relative" ref={professionInputRef}>
                <div className="bg-white border border-gray-100 rounded-full px-3 py-2 h-11 flex items-center gap-2 shadow-lg">
                  <UserIcon className="w-4 h-4 text-gray-700" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleProfessionChange(e.target.value)}
                    onFocus={() => {
                      if (searchQuery.length > 0) {
                        const filtered = professions.filter((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
                        setFilteredProfessions(filtered)
                        setShowProfessionSuggestions(true)
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setShowProfessionSuggestions(false)
                        loadData(mode, searchQuery, location)
                      }
                    }}
                    className="flex-1 text-gray-900 text-sm bg-transparent outline-none placeholder-gray-500"
                    placeholder={mode === "hirer" ? "Browse talents..." : "Browse jobs..."}
                    autoComplete="off"
                  />
                  <div
                    className="hover:bg-gray-100 rounded-full p-1.5 transition-colors cursor-pointer"
                    onClick={() => loadData(mode, searchQuery, location)}
                  >
                    <Search className="w-4 h-4 text-gray-700" />
                  </div>
                </div>
                {showProfessionSuggestions && filteredProfessions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-md mt-1 z-50 max-h-40 overflow-y-auto border border-gray-100">
                    {filteredProfessions.map((profession, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(profession)
                          setShowProfessionSuggestions(false)
                          loadData(mode, profession, location)
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
                <div className="pt-1">
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
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4" style={{ paddingTop: "130px", paddingBottom: "120px" }}>
          {mode === "hirer" ? (
            filteredTalents.length > 0 ? (
              filteredTalents.map((talent) => <TalentCard key={talent.id} talent={talent} />)
            ) : (
              <Card className="rounded-2xl border border-gray-100 bg-white p-6 text-center">
                <p className="text-gray-600">No talents found matching your criteria.</p>
              </Card>
            )
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <Link key={job.id} href={`/job/${job.id}`}>
                <JobCard job={job} />
              </Link>
            ))
          ) : (
            <Card className="rounded-2xl border border-gray-100 bg-white p-6 text-center">
              <p className="text-gray-600">No jobs found matching your criteria.</p>
            </Card>
          )}
        </div>

        {isCalendarOpen ? (
          <div className="fixed bottom-0 left-0 right-0 z-[60]" style={{ bottom: "64px" }}>
            <div className="max-w-md mx-auto px-4">
              <div className="bg-white rounded-t-xl px-4 pb-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDateRange({})
                      setIsCalendarOpen(false)
                    }}
                    className="flex-1 rounded-full bg-white border-gray-300 text-black h-10 hover:bg-gray-50"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={() => setIsCalendarOpen(false)}
                    className="flex-1 bg-black hover:bg-gray-800 rounded-full text-white h-10"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          mode === "hirer" && (
            <div className="fixed bottom-16 left-0 right-0 z-[55] pb-4">
              <div className="max-w-md mx-auto px-4">
                <div className="ml-[50%]">
                  <Link href="/create-job">
                    <Button className="h-10 px-2 rounded-full bg-white text-gray-900 hover:bg-gray-50 shadow-lg border border-gray-100 flex items-center gap-2 w-full">
                      <span className="text-sm font-medium">New Job</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
