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
  Users,
  CheckCircle,
  UserPlus,
  XCircle,
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import ModeSwitcher from "@/components/mode-switcher"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
  getCurrentMode,
  getInvitationsForJob,
  getApplicationsForJob,
  getTalentById,
  updateInvitationStatus,
  confirmTalent,
  type Job,
  type Invitation,
  type Application,
  type Talent,
} from "@/lib/data-store"

// ... keep other existing imports if present ...

interface TalentWithStatus extends Talent {
  status: string
}

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [mode, setMode] = useState<"hirer" | "talent">("hirer")
  const [loading, setLoading] = useState(true)

  // Added: invitations/applications + active tab
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [activeTab, setActiveTab] = useState<"invited" | "applications" | "confirmed">("invited")

  useEffect(() => {
    const m = getCurrentMode()
    setMode(m)
    setLoading(true)
    ;(async () => {
      try {
        const res = await fetch(`/api/jobs?id=${encodeURIComponent(jobId)}`, { cache: "no-store" })
        if (res.ok) {
          const { job: dbJob } = await res.json()
          if (dbJob) {
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
            // Load invites/apps from mock store (DB wiring can come later)
            setInvitations(getInvitationsForJob(dbJob.id))
            setApplications(getApplicationsForJob(dbJob.id))
            setLoading(false)
            return
          }
        }
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

  // Helpers for talents lists
  const getTalentsForSection = (section: "invited" | "applications" | "confirmed"): TalentWithStatus[] => {
    if (!job || !selectedRole) return []
    switch (section) {
      case "invited":
        return invitations
          .filter((inv) => inv.roleId === selectedRole)
          .map((inv) => {
            const t = getTalentById(inv.talentId)
            return t ? { ...t, status: inv.status } : null
          })
          .filter(Boolean) as TalentWithStatus[]
      case "applications":
        return applications
          .filter((app) => app.roleId === selectedRole && app.status === "applied")
          .map((app) => {
            const t = getTalentById(app.talentId)
            return t ? { ...t, status: app.status } : null
          })
          .filter(Boolean) as TalentWithStatus[]
      case "confirmed":
        return applications
          .filter((app) => app.roleId === selectedRole && app.status === "confirmed")
          .map((app) => {
            const t = getTalentById(app.talentId)
            return t ? { ...t, status: app.status } : null
          })
          .filter(Boolean) as TalentWithStatus[]
      default:
        return []
    }
  }

  const handleInvitationResponse = (invId: string, response: "accepted" | "declined") => {
    try {
      updateInvitationStatus(invId, response)
      setInvitations(getInvitationsForJob(jobId))
    } catch {
      // no-op UI error toast here to keep changes minimal
    }
  }

  const handleConfirm = (tid: string, roleId: string) => {
    try {
      confirmTalent(jobId, tid, roleId)
      setApplications(getApplicationsForJob(jobId))
    } catch {
      // no-op UI error toast here to keep changes minimal
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

  const invitedTalents = getTalentsForSection("invited")
  const applicationTalents = getTalentsForSection("applications")
  const confirmedTalents = getTalentsForSection("confirmed")

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
        {/* Summary */}
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
              <Users className="w-4 h-4 mt-1 flex-shrink-0 text-gray-600" />
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

        {/* Description */}
        {job.description ? (
          <Card className="rounded-2xl border-0 bg-white shadow-lg hover:shadow-xl transition-shadow p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Job Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{job.description}</p>
          </Card>
        ) : null}

        {/* Roles list */}
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

        {/* Hirer: Invited / Applications / Confirmed */}
        {mode === "hirer" && selectedRole && (
          <Card className="rounded-2xl border-0 bg-white shadow-lg hover:shadow-xl transition-shadow p-4">
            {/* Simple tabs (buttons) */}
            <div className="bg-gradient-to-r from-gray-50 to-white shadow-inner p-1 rounded-full mb-4">
              <div className="grid grid-cols-3 gap-1">
                <Button
                  onClick={() => setActiveTab("invited")}
                  variant="ghost"
                  className={`justify-center rounded-full text-sm font-medium h-8 px-2 ${
                    activeTab === "invited" ? "bg-white text-black shadow-sm" : "bg-transparent text-gray-500"
                  }`}
                >
                  Invited ({invitedTalents.length})
                </Button>
                <Button
                  onClick={() => setActiveTab("applications")}
                  variant="ghost"
                  className={`justify-center rounded-full text-sm font-medium h-8 px-2 ${
                    activeTab === "applications" ? "bg-white text-black shadow-sm" : "bg-transparent text-gray-500"
                  }`}
                >
                  Applications ({applicationTalents.length})
                </Button>
                <Button
                  onClick={() => setActiveTab("confirmed")}
                  variant="ghost"
                  className={`justify-center rounded-full text-sm font-medium h-8 px-2 ${
                    activeTab === "confirmed" ? "bg-white text-black shadow-sm" : "bg-transparent text-gray-500"
                  }`}
                >
                  Confirmed ({confirmedTalents.length})
                </Button>
              </div>
            </div>

            {/* Lists */}
            <div className="space-y-2">
              {activeTab === "invited" &&
                (invitedTalents.length ? (
                  invitedTalents.map((t) => {
                    // Find invitation to show actions if pending
                    const inv = invitations.find((i) => i.talentId === t.id && i.roleId === selectedRole)
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={t.avatar || ""} alt={t.name} />
                            <AvatarFallback>{t.name?.[0] || "T"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{t.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{t.role?.replace("-", " ")}</div>
                          </div>
                        </div>
                        {inv?.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="rounded-full h-7 px-3 bg-black text-white"
                              onClick={() => handleInvitationResponse(inv.id, "accepted")}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full h-7 px-3"
                              onClick={() => handleInvitationResponse(inv.id, "declined")}
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600">{inv?.status || t.status}</span>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-500 text-center py-6">No invited talents for this role</p>
                ))}

              {activeTab === "applications" &&
                (applicationTalents.length ? (
                  applicationTalents.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={t.avatar || ""} alt={t.name} />
                          <AvatarFallback>{t.name?.[0] || "T"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{t.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{t.role?.replace("-", " ")}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-full h-7 px-3 bg-black text-white"
                        onClick={() => handleConfirm(t.id, selectedRole)}
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Confirm
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-6">No applications for this role yet</p>
                ))}

              {activeTab === "confirmed" &&
                (confirmedTalents.length ? (
                  confirmedTalents.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={t.avatar || ""} alt={t.name} />
                          <AvatarFallback>{t.name?.[0] || "T"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{t.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{t.role?.replace("-", " ")}</div>
                        </div>
                      </div>
                      <span className="inline-flex items-center text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Confirmed
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-6">No confirmed talents yet</p>
                ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
