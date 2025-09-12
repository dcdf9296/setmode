"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle,
  Euro,
  MapPin,
  MoreVertical,
  Send,
  Users,
  UserPlus,
  XCircle,
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import ModeSwitcher from "@/components/mode-switcher"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
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

  useEffect(() => {
    const m = getCurrentMode()
    setMode(m)

    const j = getJobById(jobId)
    if (j) {
      setJob(j)
      setSelectedRole(j.roles[0]?.id || "")
      setInvitations(getInvitationsForJob(jobId))
      setApplications(getApplicationsForJob(jobId))
    }
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

  const handleInvitationResponse = (invId: string, response: "accepted" | "declined") => {
    try {
      updateInvitationStatus(invId, response)
      setInvitations(getInvitationsForJob(jobId))
      toast.success(`Invitation ${response} successfully!`)
    } catch {
      toast.error("Failed to respond to invitation. Please try again.")
    }
  }

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

  const currentInvitation = invitations.find((inv) => inv.talentId === "1" && inv.roleId === selectedRole)
  const hasApplied = hasAppliedForRole("1", jobId, selectedRole)

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
                    {role.role.replace("-", " ")}
                  </Badge>
                ))}
              </div>
            </li>
          </ul>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-lg hover:shadow-xl transition-shadow p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Job Description</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{job.description}</p>
        </Card>

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
                    <h4 className="font-medium text-gray-900 text-sm capitalize">{role.role.replace("-", " ")}</h4>
                    <p className="text-xs text-gray-500">
                      {role.startDate} - {role.endDate}
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

                {mode === "talent" && selectedRole === role.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {currentInvitation ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600 font-medium">You're invited to this role</span>

                        {currentInvitation.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleInvitationResponse(currentInvitation.id, "accepted")
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleInvitationResponse(currentInvitation.id, "declined")
                              }}
                              className="border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 text-xs"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Decline
                            </Button>
                          </div>
                        )}

                        {currentInvitation.status === "accepted" && (
                          <span className="text-xs text-green-600 font-medium">Invitation Accepted</span>
                        )}
                        {currentInvitation.status === "declined" && (
                          <span className="text-xs text-red-600 font-medium">Invitation Declined</span>
                        )}
                      </div>
                    ) : hasApplied ? (
                      <span className="text-xs text-green-600 font-medium">Application Submitted</span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApplyForRole(role.id)
                        }}
                        className="bg-black hover:bg-gray-800 text-white px-4 py-2 text-xs"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Apply for this role
                      </Button>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </Card>

        {mode === "hirer" && (
          <Card className="rounded-2xl border-0 bg-white shadow-lg hover:shadow-xl transition-shadow p-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
              <div className="bg-gradient-to-r from-gray-50 to-white shadow-inner p-1 rounded-full mb-4">
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    onClick={() => setActiveTab("invited")}
                    variant="ghost"
                    className={`justify-center rounded-full text-sm font-medium h-8 px-2 ${
                      activeTab === "invited" ? "bg-white text-black shadow-sm" : "bg-transparent text-gray-500"
                    }`}
                  >
                    Invited ({getTalentsForSection("invited")?.length || 0})
                  </Button>
                  <Button
                    onClick={() => setActiveTab("applications")}
                    variant="ghost"
                    className={`justify-center rounded-full text-sm font-medium h-8 px-2 ${
                      activeTab === "applications" ? "bg-white text-black shadow-sm" : "bg-transparent text-gray-500"
                    }`}
                  >
                    Applications ({getTalentsForSection("applications")?.length || 0})
                  </Button>
                  <Button
                    onClick={() => setActiveTab("confirmed")}
                    variant="ghost"
                    className={`justify-center rounded-full text-sm font-medium h-8 px-2 ${
                      activeTab === "confirmed" ? "bg-white text-black shadow-sm" : "bg-transparent text-gray-500"
                    }`}
                  >
                    Confirmed ({getTalentsForSection("confirmed")?.length || 0})
                  </Button>
                </div>
              </div>

              <TabsContent value="invited" className="mt-0">
                {invitedTalents.length ? (
                  invitedTalents.map((talent) => (
                    <TalentRow key={talent.id} talent={talent} onClick={() => handleTalentClick(talent.slug)} />
                  ))
                ) : (
                  <EmptyState message="No invited talents for this role yet" />
                )}
              </TabsContent>

              <TabsContent value="applications" className="mt-0">
                {applicationTalents.length ? (
                  applicationTalents.map((talent) => (
                    <TalentRow
                      key={talent.id}
                      talent={talent}
                      action={
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleConfirm(talent.id, selectedRole)
                          }}
                          className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full text-xs flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3" />
                          Confirm
                        </Button>
                      }
                      onClick={() => handleTalentClick(talent.slug)}
                    />
                  ))
                ) : (
                  <EmptyState message="No applications for this role yet" />
                )}
              </TabsContent>

              <TabsContent value="confirmed" className="mt-0">
                {confirmedTalents.length ? (
                  confirmedTalents.map((talent) => (
                    <TalentRow
                      key={talent.id}
                      talent={talent}
                      statusBadge="Confirmed"
                      onClick={() => handleTalentClick(talent.slug)}
                    />
                  ))
                ) : (
                  <EmptyState message="No confirmed talents for this role yet" />
                )}
              </TabsContent>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  )
}

interface TalentWithStatusRowProps {
  talent: TalentWithStatus
  onClick: () => void
  action?: React.ReactNode
  statusBadge?: string
}

function TalentRow({ talent, onClick, action, statusBadge }: TalentWithStatusRowProps) {
  return (
    <button type="button" onClick={onClick} className="w-full mb-3">
      <div className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 text-left">
          <Avatar className="w-10 h-10">
            <AvatarImage src={talent.avatar || "/placeholder.svg"} alt={talent.name} />
            <AvatarFallback>{talent.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">{talent.name}</p>
            <p className="text-xs text-gray-600 capitalize">{talent.role}</p>
            <p className="text-xs text-gray-500">{talent.location}</p>
          </div>
        </div>
        {action ? (
          action
        ) : statusBadge ? (
          <Badge className="text-xs bg-green-100 text-green-800 font-medium">{statusBadge}</Badge>
        ) : talent.status ? (
          <Badge
            className={cn("text-xs capitalize font-medium", {
              "bg-green-100 text-green-800": talent.status === "accepted",
              "bg-red-100 text-red-800": talent.status === "declined",
              "bg-gray-100 text-gray-800": talent.status === "pending",
            })}
          >
            {talent.status}
          </Badge>
        ) : null}
      </div>
    </button>
  )
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-center text-sm text-gray-500 py-8">{message}</p>
}
