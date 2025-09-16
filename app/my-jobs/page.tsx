"use client"

import { useState, useEffect } from "react"
import { Search, Plus, MapPin, Briefcase, Calendar, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import TopNav from "@/app/components/top-nav"
import { supabase } from "@/lib/supabase/client"
import { getCurrentUser } from "@/lib/auth-simple"

interface Job {
  id: string
  title: string
  description: string
  location: string
  roles_needed: string[]
  budget: number
  currency: string
  date: string
  status: string
  hirer_id: string
  created_at: string
  updated_at: string
  startDate: string
  endDate: string
  hirer?: {
    full_name: string
    profile_picture_url?: string
  }
}

interface Application {
  id: string
  job_id: string
  talent_id: string
  role: string
  status: string
  message?: string
  created_at: string
  job?: Job
}

interface Invitation {
  id: string
  job_id: string
  talent_id: string
  role: string
  status: string
  message?: string
  created_at: string
  job?: Job
}

export default function MyJobsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "confirmed" | "inprogress" | "invitations" | "applications">
  (
    "all",
  )
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [mode, setMode] = useState<"hirer" | "talent">("hirer")
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadUserAndData()
  }, [])

  const loadUserAndData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // Fallback to custom auth
      const simple = await getCurrentUser()
      const primaryUserId = session?.user?.id || simple?.id || null

      if (!primaryUserId) {
        toast.error("Please log in")
        setIsLoading(false)
        return
      }

      setUser(session?.user || simple || null)

      const currentMode = (localStorage.getItem("currentMode") as "hirer" | "talent") || "hirer"
      setMode(currentMode)

      if (currentMode === "hirer") {
        await loadHirerJobs(primaryUserId)
      } else {
        // Avoid calling supabase.from on client wrapper; implement later
        // await loadTalentOpportunities(primaryUserId)
      }
    } catch (error) {
      console.error("Error loading opportunities:", error)
      toast.error("Failed to load opportunities")
    } finally {
      setIsLoading(false)
    }
  }

  const loadHirerJobs = async (userId: string) => {
    try {
      const res = await fetch(`/api/jobs?hirerId=${encodeURIComponent(userId)}`, { cache: "no-store" })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || "Failed to fetch jobs")
      }
      const { jobs: jobsData } = await res.json()

      // Normalize to include startDate and endDate; build roles_needed from role if missing.
      const normalized = (jobsData || []).map((j: any) => {
        const start = j.startDate || j.date || null
        const end = j.endDate || null
        return {
          ...j,
          startDate: start,
          endDate: end,
          roles_needed:
            Array.isArray(j.roles_needed) && j.roles_needed.length > 0 ? j.roles_needed : j.role ? [j.role] : [],
        }
      })

      setJobs(normalized)
    } catch (error) {
      console.error("Error loading hirer jobs:", error)
      toast.error("Failed to load jobs")
    }
  }

  const handleCreateJob = () => router.push("/create-job")
  const handleJobClick = (id: string) => router.push(`/job/${id}`)

  const getFilteredData = () => {
    if (mode === "hirer") {
      return (jobs || []).filter((job) => {
        const matchesSearch = !searchQuery || job.title.toLowerCase().includes(searchQuery.toLowerCase())
        if (!matchesSearch) return false

        switch (activeFilter) {
          case "confirmed":
            return job.status === "confirmed"
          case "inprogress":
            return job.status === "active" || job.status === "in_progress"
          default:
            return true
        }
      })
    } else {
      const all: Array<{
        id: string
        title: string
        location: string
        created_at: string
        status: string
        type: "invitation" | "application"
        role?: string
        job?: Job
        budget?: number
        currency?: string
        date?: string
        startDate?: string
        endDate?: string
      }> = []

      (invitations || []).forEach((inv) => {
        if (inv.job) {
          all.push({
            id: inv.job.id,
            title: inv.job.title,
            location: inv.job.location,
            created_at: inv.created_at,
            status: inv.status,
            type: "invitation",
            role: inv.role,
            job: inv.job,
            budget: inv.job.budget,
            currency: inv.job.currency,
            date: inv.job.date,
            startDate: inv.job.startDate,
            endDate: inv.job.endDate,
          })
        }
      })

      (applications || []).forEach((app) => {
        if (app.job) {
          all.push({
            id: app.job.id,
            title: app.job.title,
            location: app.job.location,
            created_at: app.created_at,
            status: app.status,
            type: "application",
            role: app.role,
            job: app.job,
            budget: app.job.budget,
            currency: app.job.currency,
            date: app.job.date,
            startDate: app.job.startDate,
            endDate: app.job.endDate,
          })
        }
      })

      return all.filter((item) => {
        const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase())
        if (!matchesSearch) return false

        switch (activeFilter) {
          case "invitations":
            return item.type === "invitation"
          case "applications":
            return item.status === "applied"
          case "confirmed":
            return item.status === "confirmed"
          default:
            return true
        }
      })
    }
  }

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "accepted":
      case "confirmed":
        return "text-green-600"
      case "pending":
      case "applied":
        return "text-blue-600"
      case "declined":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending":
      case "applied":
        return <Clock className="w-4 h-4 text-blue-600" />
      default:
        return <Briefcase className="w-4 h-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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

        <div className="fixed left-0 right-0 z-[55] bg-transparent pb-0" style={{ top: "74px" }}>
          <div className="max-w-md mx-auto px-4">
            <div className="flex items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={mode === "hirer" ? "Search jobs..." : "Search opportunities..."}
                  className="w-full pl-10 pr-4 py-3 bg-white border-0 rounded-l-full text-gray-900 placeholder-gray-500 shadow-lg hover:shadow-xl transition-shadow focus:ring-0 focus:outline-none"
                />
              </div>
              {mode === "hirer" && (
                <Button
                  onClick={handleCreateJob}
                  className="bg-white hover:bg-gray-50 text-black px-4 py-3 rounded-r-full text-sm font-medium flex items-center gap-2 whitespace-nowrap shadow-lg border-l-0 border border-gray-200"
                >
                  <Plus className="w-4 h-4" />
                  Create Job
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 pb-20" style={{ paddingTop: "69px" }}>
          <div className="bg-gradient-to-r from-gray-50 to-white shadow-inner p-1 rounded-full mb-4">
            <div className="grid grid-cols-3 gap-1">
              {mode === "hirer" ? (
                <>
                  <Button
                    onClick={() => setActiveFilter("all")}
                    variant="ghost"
                    className={`justify-center rounded-full text-sm font-medium h-8 px-2 ${
                      activeFilter === "all" ? "bg-white text-black shadow-sm" : "bg-transparent text-gray-500"
                    }`}
                  >
                    All Jobs
                  </Button>
                  <Button
                    onClick={() => setActiveFilter("confirmed")}
                    variant="ghost"
                    className={`justify-center rounded-full text-sm font-medium h-8 px-2 ${
                      activeFilter === "confirmed" ? "bg-white text-black shadow-sm" : "bg-transparent text-gray-500"
                    }`}
                  >
                    Confirmed
                  </Button>
                  <Button
                    onClick={() => setActiveFilter("inprogress")}
                    variant="ghost"
                    className={`justify-center rounded-full text-sm font-medium h-8 px-2 ${
                      activeFilter === "inprogress" ? "bg-white text-black shadow-sm" : "bg-transparent text-gray-500"
                    }`}
                  >
                    In Progress
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setActiveFilter("invitations")}
                    variant="ghost"
                    className={`justify-center rounded-full text-sm font-medium h-8 px-2 ${
                      activeFilter === "invitations" ? "bg-white text-black shadow-sm" : "bg-transparent text-gray-500"
                    }`}
                  >
                    Invitations
                  </Button>
                  <Button
                    onClick={() => setActiveFilter("applications")}
                    variant="ghost"
                    className={`justify-center rounded-full text-sm font-medium h-8 px-2 ${
                      activeFilter === "applications" ? "bg-white text-black shadow-sm" : "bg-transparent text-gray-500"
                    }`}
                  >
                    Applications
                  </Button>
                  <Button
                    onClick={() => setActiveFilter("confirmed")}
                    variant="ghost"
                    className={`justify-center rounded-full text-sm font-medium h-8 px-2 ${
                      activeFilter === "confirmed" ? "bg-white text-black shadow-sm" : "bg-transparent text-gray-500"
                    }`}
                  >
                    Confirmed
                  </Button>
                </>
              )}
            </div>
          </div>

          {getFilteredData().length > 0 ? (
            <div className="rounded-2xl border-0 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="divide-y divide-gray-200">
                {getFilteredData().map((item: any, index: number) => {
                  const isJobItem = mode === "hirer"
                  const job = isJobItem ? item : item.job

                  return (
                    <div
                      key={`${job?.id || item.id}-${index}`}
                      onClick={() => handleJobClick(job?.id || item.id)}
                      className="px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="text-base font-semibold text-gray-900">{job?.title || item.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          {(job.startDate || job.endDate) && (
                            <>
                              <Calendar className="w-4 h-4" />
                              <span className="whitespace-nowrap">
                                {job.startDate && job.endDate && job.startDate !== job.endDate
                                  ? `from ${job.startDate} to ${job.endDate}`
                                  : job.startDate
                                    ? `from ${job.startDate}`
                                    : `to ${job.endDate}`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <span>{job.location}</span>

                        {job.roles_needed?.length ? (
                          <>
                            <span className="mx-2 text-gray-300">•</span>
                            <Briefcase className="w-4 h-4 text-gray-600" />
                            <div className="flex flex-wrap gap-1">
                              {job.roles_needed.map((r: string) => (
                                <Badge
                                  key={r}
                                  variant="outline"
                                  className="bg-white border-gray-300 text-gray-700 capitalize font-normal"
                                >
                                  {r}
                                </Badge>
                              ))}
                            </div>
                          </>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        {getStatusIcon(item.status || job?.status)}
                        <span className={`text-xs capitalize ${getJobStatusColor(item.status || job?.status)}`}>
                          {item.status || job?.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-0 bg-white shadow-lg hover:shadow-xl transition-shadow p-8 text-center">
              <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {mode === "hirer" ? "No jobs found" : "No opportunities found"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : mode === "hirer"
                    ? "Create your first job to get started"
                    : "Check back later for new opportunities"}
              </p>
              {mode === "hirer" && !searchQuery && (
                <Button onClick={handleCreateJob} className="bg-black text-white rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
