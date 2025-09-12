"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Bell, MoreVertical, Plus, X, Calendar, MapPin, Euro } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import type { JobRole } from "@/lib/data-store"
import { toast } from "sonner"
import ModeSwitcher from "@/components/mode-switcher"
import { Card, CardContent } from "@/components/ui/card"

export default function CreateJobPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [roleEntries, setRoleEntries] = useState<JobRole[]>([
    {
      id: Date.now().toString(),
      role: "",
      startDate: "",
      endDate: "",
      budget: 0,
    },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleBack = () => {
    router.back()
  }

  const addRole = () => {
    setRoleEntries([
      ...roleEntries,
      {
        id: Date.now().toString(),
        role: "",
        startDate: "",
        endDate: "",
        budget: 0,
      },
    ])
  }

  const removeRole = (index: number) => {
    if (roleEntries.length > 1) {
      setRoleEntries(roleEntries.filter((_, i) => i !== index))
    }
  }

  const updateRole = (index: number, field: keyof JobRole, value: string | number) => {
    const updated = [...roleEntries]
    updated[index] = { ...updated[index], [field]: value }
    setRoleEntries(updated)
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !location.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    const incompleteRoles = roleEntries.some(
      (role) => !role.role || !role.startDate || !role.endDate || role.budget <= 0,
    )

    if (incompleteRoles) {
      toast.error("Please complete all role details")
      return
    }

    setIsSubmitting(true)

    try {
      const jobData = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        roles_needed: roleEntries.map((role) => role.role),
        budget: Math.max(...roleEntries.map((role) => role.budget)),
        currency: "EUR",
        date: roleEntries[0].startDate,
        status: "active",
      }

      console.log("[v0] Creating job with data:", jobData)

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      })

      const result = await response.json()
      console.log("[v0] Job creation response:", result)

      if (response.ok && result.job) {
        toast.success("Job created successfully!")
        router.push("/my-jobs")
      } else {
        throw new Error(result.error || "Failed to create job")
      }
    } catch (error) {
      console.error("[v0] Job creation error:", error)
      toast.error("Failed to create job. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white antialiased font-sans">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 bg-white px-4 py-3 flex items-center justify-between z-40 max-w-md mx-auto h-16">
          <div className="flex items-center gap-2">
            <Button onClick={handleBack} variant="ghost" className="p-0">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
            <h1 className="text-black font-bold ml-2" style={{ fontSize: "18px" }}>
              Create Job
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ModeSwitcher />
            <Bell className="w-5 h-5 text-black" />
            <MoreVertical className="w-5 h-5 text-black" />
          </div>
        </header>

        {/* Content */}
        <div className="pt-16 pb-32">
          {/* Job Details */}
          <Card className="rounded-2xl border border-gray-200 bg-white mx-4 mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Job Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Job Title</label>
                  <Input
                    placeholder="e.g. Hair Stylist for Fashion Week"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white text-black border-gray-200 focus:border-black focus:ring-black rounded-full placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                  <Textarea
                    placeholder="Describe the job requirements, expectations, and any specific details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white text-black border-gray-200 focus:border-black focus:ring-black rounded-2xl placeholder:text-gray-500 min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="e.g. Milan, Italy"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="bg-white text-black border-gray-200 focus:border-black focus:ring-black rounded-full placeholder:text-gray-500 pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles & Details */}
          <Card className="rounded-2xl border border-gray-200 bg-white mx-4 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Roles</h2>
                <Button
                  onClick={addRole}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Role
                </Button>
              </div>

              <div className="space-y-4">
                {roleEntries.map((role, index) => (
                  <div key={role.id} className="border-b border-gray-200 pb-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900">Role #{index + 1}</h4>
                      {roleEntries.length > 1 && (
                        <Button
                          onClick={() => removeRole(index)}
                          variant="ghost"
                          className="p-1 hover:bg-red-100 text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Role Type</label>
                        <Select value={role.role} onValueChange={(value) => updateRole(index, "role", value)}>
                          <SelectTrigger className="bg-white border-gray-200 focus:border-black focus:ring-black rounded-full">
                            <SelectValue placeholder="Select role type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white text-black">
                            <SelectItem value="hair-stylist">Hair Stylist</SelectItem>
                            <SelectItem value="makeup-artist">Makeup Artist</SelectItem>
                            <SelectItem value="photographer">Photographer</SelectItem>
                            <SelectItem value="model">Model</SelectItem>
                            <SelectItem value="fashion-stylist">Fashion Stylist</SelectItem>
                            <SelectItem value="creative-director">Creative Director</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                              type="date"
                              value={role.startDate}
                              onChange={(e) => updateRole(index, "startDate", e.target.value)}
                              className="bg-white border-gray-200 focus:border-black focus:ring-black rounded-full pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                              type="date"
                              value={role.endDate}
                              onChange={(e) => updateRole(index, "endDate", e.target.value)}
                              className="bg-white border-gray-200 focus:border-black focus:ring-black rounded-full pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Daily Budget (€)</label>
                        <div className="relative">
                          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            type="number"
                            placeholder="0"
                            value={role.budget || ""}
                            onChange={(e) => updateRole(index, "budget", Number.parseInt(e.target.value) || 0)}
                            className="bg-white border-gray-200 focus:border-black focus:ring-black rounded-full pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fixed Bottom Button */}
        <div
          className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white rounded-t-xl"
          style={{ paddingBottom: "80px" }}
        >
          <div className="p-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-full disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isSubmitting ? "Creating Job..." : "Create Job"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
