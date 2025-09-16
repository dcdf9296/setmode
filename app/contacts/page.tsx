"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Bell,
  Calendar,
  Euro,
  MapPin,
  MoreVertical,
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import ModeSwitcher from "@/components/mode-switcher"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

import {
  getJobById,
  getInvitationsForJob,
  getApplicationsForJob,
  updateInvitationStatus,
  getTalentById,
  confirmTalent,
  hasAppliedForRole,
  saveApplication,
  generateId,
  getCurrentMode,
  type Job,
  type Invitation,
  type Application,
  type Talent,
} from "@/lib/data-store"
import { toast } from "sonner"

interface TalentWithStatus extends Talent {
  status: string
}

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"invited" | "applications" | "confirmed">("invited")
  const [mode, setMode] = useState<"hirer" | "talent">("hirer")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const m = getCurrentMode()
    setMode(m)
    setLoading(true)
    ;(async () => {
      try {
        // Try DB first via API (by id)
        const res = await fetch(`/api/jobs?id=${encodeURIComponent(jobId)}`, { cache: "no-store" })
        if (res.ok) {
          const { job: dbJob } = await res.json()
          if (dbJob) {
            // Map DB row -> UI Job shape used here
            const mapped: Job = {
              id: dbJob.id,
              title: dbJob.title,
              description: dbJob.description || "",
              location: dbJob.location || "",
              createdAt: dbJob.created_at || new Date().toISOString(),
              roles: [
                {
                  id: "primary",
                  role: (dbJob.roles_needed?.[0] || dbJob.role || "unspecified") as string,
                  startDate: dbJob.start_date || dbJob.date || "",
                  endDate:
                    dbJob.end_date ||
                    (dbJob.deadline ? new Date(dbJob.deadline).toISOString().slice(0, 10) : dbJob.date || ""),
                  budget: dbJob.budget ?? 0,
                },
              ],
              hirerId: dbJob.hirer_id || "",
              invitedTalentIds: [],
              status: dbJob.status || "active",
            }
            setJob(mapped)
            setSelectedRole(mapped.roles[0]?.id || "")
            setInvitations([]) // wire DB later
            setApplications([]) // wire DB later
            setLoading(false)
            return
          }
        }
        // If not in DB, no fallback mock here (to keep it simple)
        setJob(null)
      } catch {
        setJob(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [jobId])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleBack = () => router.back()

  const handleTalentClick = (talentSlug: string) => {
    router.push(`/talent/${talentSlug}?from=job&jobId=${jobId}`)
  }

  const handleConfirm = (tid: string, roleId: string) => {
    try {
      confirmTalent(jobId, tid, roleId)
      setApplications(getApplicationsForJob(jobId))
      toast.success("Talent confirmed successfully!")
    } catch {
      toast.error("Failed to confirm talent. Please try again.")
    }
  }

  const handleApplyForRole = (roleId: string) => {
    try {
      const application: Application = {
        id: generateId(),
        jobId,
        talentId: "1",
        roleId,
        status: "applied",
        createdAt: new Date().toISOString(),
      }
      saveApplication(application)
      setApplications(getApplicationsForJob(jobId))
      toast.success("Application submitted successfully!")
    } catch {
      toast.error("Failed to submit application. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Job not found</p>
      </div>
    )
  }

  const getTalentsForSection = (section: "invited" | "applications" | "confirmed"): TalentWithStatus[] => {
    if (!job || !selectedRole) return []
    // ... unchanged ...
  }

  const currentInvitation = invitations.find((inv) => inv.talentId === "1" && inv.roleId === selectedRole)
  const hasApplied = hasAppliedForRole("1", jobId, selectedRole)

  return (
    <div className="min-h-screen bg-white antialiased font-sans">
      <header className="fixed inset-x-0 top-0 z-40 h-16 bg-white flex items-center justify-between px-4 max-w-md mx-auto mb-4">
        <div className="flex items-center gap-1">
          <Button onClick={handleBack} variant="ghost" className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <ModeSwitcher />
          <Bell className="w-5 h-5 text-black" />
          <MoreVertical className="w-5 h-5 text-black" />
        </div>
      </header>

      <div className="max-w-md mx-auto pt-20 px-4 pb-24">
        <Card className="rounded-2xl border-0 bg-white shadow-lg hover:shadow-xl transition-shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">{job.title}</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-600" />
              {format(new Date(job.createdAt), "PPP")}
            </li>
            <li className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-600" />
              {job.location}
            </li>
            <li className="flex items-start gap-2 text-sm">
              <div className="flex flex-wrap gap-1">
                {job.roles.map((role) => (
                  <Badge
                    key={role.id}
                    variant="outline"
                    className="bg-white border-gray-300 text-gray-700 capitalize font-normal"
                  >
                    {role.role?.toString().replace("-", " ")}
                  </Badge>
                ))}
              </div>
            </li>
          </ul>
        </Card>

        {job.description ? (
          <Card className="rounded-2xl border-0 bg-white shadow-lg hover:shadow-xl transition-shadow p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Job Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{job.description}</p>
          </Card>
        ) : null}

        <Card className="rounded-2xl border-0 bg-white shadow-lg hover:shadow-xl transition-shadow p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {mode === "hirer" ? "Select Role" : "Available Roles"}
          </h3>

          <div className="space-y-3">
            {job.roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full text-left p-4 rounded-xl transition-all bg-white shadow-sm hover:shadow-md ${
                  selectedRole === role.id ? "border-2 border-black" : "border border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm capitalize">{role.role?.toString().replace("-", " ")}</h4>
                    <p className="text-xs text-gray-500">
                      {role.startDate || "-"} - {role.endDate || "-"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="flex items-center gap-1 font-bold text-gray-900">
                      <Euro className="w-4 h-4" />
                      {role.budget}
                      <span className="text-sm font-normal text-gray-600">/day</span>
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
