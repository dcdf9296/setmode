"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  Bell,
  MoreVertical,
  UserPlus,
  Euro,
  ChevronDown,
  ChevronUp,
  Plus,
  Calendar,
  MapPin,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import {
  getJobs,
  saveInvitation,
  generateId,
  type Job,
  type Talent,
  type Invitation,
  getTalentById,
  getCurrentMode,
} from "@/lib/data-store"
import { toast } from "sonner"
import ModeSwitcher from "@/components/mode-switcher"
import TalentInfoCard from "@/app/components/talent-info-card"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export default function InviteToJobPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const talentId = searchParams.get("talentId")
  const [mode, setMode] = useState<"hirer" | "talent">("hirer")
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<{ jobId: string; roleId: string } | null>(null)
  const [talent, setTalent] = useState<Talent | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const currentMode = getCurrentMode()
    setMode(currentMode)
    if (currentMode === "talent") {
      toast.error("Only hirers can invite talent to jobs.")
      router.replace("/")
      return
    }
    if (talentId) {
      const talentData = getTalentById(talentId)
      setTalent(talentData || null)
    }
    setJobs(getJobs())
  }, [talentId, router])

  const handleBack = () => router.back()

  const handleJobClick = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId)
    setSelectedRole(null)
  }

  const handleRoleSelect = (jobId: string, roleId: string) => {
    setSelectedRole({ jobId, roleId })
  }

  const handleCreateJob = () => {
    router.push("/create-job")
  }

  const handleSendInvitation = async () => {
    if (!selectedRole || !talent) {
      toast.error("Please select a job and a role.")
      return
    }
    setIsSubmitting(true)
    try {
      const invitation: Invitation = {
        id: generateId(),
        jobId: selectedRole.jobId,
        talentId: talent.id,
        roleId: selectedRole.roleId,
        status: "pending",
        createdAt: new Date().toISOString(),
      }
      saveInvitation(invitation)
      toast.success("Invitation sent successfully!")
      router.push(`/job/${selectedRole.jobId}?invited=${talentId}`)
    } catch (error) {
      toast.error("Failed to send invitation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (mode === "talent") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Access denied. Hirer mode only.</p>
      </div>
    )
  }

  if (!talent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Talent not found</p>
          <Button onClick={handleBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white antialiased font-sans relative">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/beauty-tools-pattern-colorful.png')",
          backgroundSize: "200px 200px",
          backgroundRepeat: "repeat",
          backgroundPosition: "0 0",
          opacity: 0.02,
        }}
      />

      <div className="max-w-md mx-auto pb-32 relative z-10">
        {/* Header */}
        <header className="bg-white px-4 py-3 flex items-center justify-between h-16 sticky top-0 z-10">
          <div className="flex items-center gap-1">
            <Button onClick={handleBack} variant="ghost" className="p-0">
              <ChevronLeft className="w-5 h-5 text-black" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <ModeSwitcher />
            <Bell className="w-5 h-5 text-black" />
            <MoreVertical className="w-5 h-5 text-black" />
          </div>
        </header>

        {/* Content */}
        <div className="pt-4 px-4">
          {/* Talent Card */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-2">You are inviting</p>
            <TalentInfoCard talent={talent} />
          </div>

          {/* Job Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Select Job & Role</h3>
              <Button
                size="sm"
                onClick={handleCreateJob}
                className="flex items-center gap-1 text-xs px-4 py-2 h-auto rounded-full bg-black text-white hover:bg-black/90"
              >
                <Plus className="w-3 h-3" />
                Create Job
              </Button>
            </div>
            <Card className="rounded-2xl border-0 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <div key={job.id}>
                    <button
                      onClick={() => handleJobClick(job.id)}
                      className="w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(job.createdAt), "PPP")}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm truncate mb-2">{job.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              {job.roles.map((role) => (
                                <Badge
                                  key={role.id}
                                  variant="outline"
                                  className="font-normal capitalize text-xs py-px bg-transparent border-gray-300 text-gray-600"
                                >
                                  {role.role.replace("-", " ")}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          {expandedJob === job.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {expandedJob === job.id && (
                      <div className="pb-4 px-4">
                        <div className="space-y-2">
                          {job.roles.map((role) => (
                            <button
                              key={role.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRoleSelect(job.id, role.id)
                              }}
                              className={`w-full p-3 text-left rounded-lg border transition-all ${
                                selectedRole?.jobId === job.id && selectedRole?.roleId === role.id
                                  ? "border-black bg-gray-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900 capitalize">
                                    {role.role.replace("-", " ")}
                                  </h5>
                                  <p className="text-xs text-gray-500">
                                    {role.startDate} - {role.endDate}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-gray-900 flex items-center gap-1">
                                    <Euro className="w-4 h-4" />
                                    <span>{role.budget}</span>
                                    <span className="text-sm font-normal text-gray-600">/day</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Fixed bottom "Send Invitation" CTA just above potential bottom navbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-t-xl px-4 pb-4">
            <Button
              onClick={handleSendInvitation}
              disabled={!selectedRole || isSubmitting}
              className="w-full h-10 bg-white hover:bg-gray-50 text-black border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow disabled:bg-gray-300 disabled:text-gray-600 disabled:opacity-100 gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </div>
      </div>

      {/* Fixed bottom right send invitation floating button */}
      <div
        className="fixed bottom-4 right-4 z-50"
        style={{ left: "50%", right: "16px", maxWidth: "448px", marginLeft: "-224px" }}
      >
        <div className="ml-[50%] pb-20">
          <Button
            onClick={handleSendInvitation}
            disabled={!selectedRole || isSubmitting}
            className="w-full h-10 bg-white hover:bg-gray-50 text-black border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow disabled:bg-gray-300 disabled:text-gray-600 disabled:opacity-100 gap-2"
          >
            <Send className="w-5 h-5" />
            {isSubmitting ? "Sending..." : "Send Invitation"}
          </Button>
        </div>
      </div>
    </div>
  )
}
