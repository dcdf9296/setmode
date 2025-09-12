"use client"
import { useEffect, useState, useRef } from "react"
import type React from "react"
import Image from "next/image"
import { Edit, Save, Plus, Trash2, UploadCloud, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { isSameDay } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import ProfileLoading from "@/components/profile-loading"
import { cn } from "@/lib/utils"
import TopNav from "@/app/components/top-nav"
import { getCurrentUser } from "@/lib/auth-simple"
import { MapPin, Briefcase } from "lucide-react"

interface User {
  id: string
  full_name: string
  email: string
  roles: string[]
  location: string
  employment_status: string
  company_name?: string
  bio?: string
  profile_picture_url?: string
  portfolio_urls?: string[]
  cv_url?: string
  phone?: string
  availability?: string
  hourly_rate?: number
  currency?: string
  experience_years?: number
  languages?: string[]
  skills?: string[]
  social_links?: any
  is_verified: boolean
  rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}

interface PortfolioItem {
  id: string
  title: string
  description: string
  year: string
  role: string
  type: "single" | "carousel"
  imageUrls: string[]
  thumbnailUrl: string
  date: string
  category: string
}

interface CVItem {
  id: string
  project: string
  year: string
  role: string
  producer: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("bio")

  // Editable states
  const [editedName, setEditedName] = useState("")
  const [editedRole, setEditedRole] = useState("")
  const [editedLocation, setEditedLocation] = useState("")
  const [editedAvatar, setEditedAvatar] = useState("")
  const [editedAvatarPreview, setEditedAvatarPreview] = useState("")
  const [editedBio, setEditedBio] = useState("")
  const [editedExperience, setEditedExperience] = useState("")
  const [editedLanguages, setEditedLanguages] = useState<string[]>([])
  const [editedSkills, setEditedSkills] = useState<string[]>([])
  const [editedPortfolio, setEditedPortfolio] = useState<PortfolioItem[]>([])
  const [editedCv, setEditedCv] = useState<CVItem[]>([])
  const [editedDates, setEditedDates] = useState<Date[] | undefined>([])

  const newLanguageInputRef = useRef<HTMLInputElement>(null)
  const newSkillInputRef = useRef<HTMLInputElement>(null)

  // Dialog states
  const [isProfileInfoModalOpen, setIsProfileInfoModalOpen] = useState(false)
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false)
  const [currentPortfolioItem, setCurrentPortfolioItem] = useState<PortfolioItem | null>(null)
  const [isCvModalOpen, setIsCvModalOpen] = useState(false)
  const [currentCvItem, setCurrentCvItem] = useState<CVItem | null>(null)

  const isSelected = (date: Date) => editedDates?.some((d) => isSameDay(d, date)) ?? false

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        console.log("[v0] Loading user profile...")
        const currentUser = await getCurrentUser()
        console.log("[v0] Current user from auth:", currentUser)

        if (!currentUser?.id) {
          console.log("[v0] No user found, redirecting to login")
          toast.error("Please log in to view your profile")
          window.location.href = "/login"
          return
        }

        console.log("[v0] Fetching profile for user ID:", currentUser.id)
        const response = await fetch(`/api/user/profile?userId=${currentUser.id}`)
        console.log("[v0] Profile API response status:", response.status)

        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }

        const userData = await response.json()
        console.log("[v0] Profile data received:", userData)

        if (userData.success && userData.user) {
          setUser(userData.user)
          populateEditFields(userData.user)
        } else {
          console.log("[v0] Profile not found in response")
          toast.error("Profile not found")
        }
      } catch (error) {
        console.error("[v0] Profile loading error:", error)
        toast.error("Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  const populateEditFields = (userData: User) => {
    setEditedName(userData.full_name || "")
    setEditedRole(userData.roles?.[0] || "")
    setEditedLocation(userData.location || "")
    setEditedAvatar(userData.profile_picture_url || "")
    setEditedAvatarPreview(userData.profile_picture_url || "")
    setEditedBio(userData.bio || "")
    setEditedExperience(userData.experience_years?.toString() || "")
    setEditedLanguages(userData.languages || [])
    setEditedSkills(userData.skills || [])
    // Portfolio and CV would need separate tables in a real implementation
    setEditedPortfolio([])
    setEditedCv([])
    setEditedDates([])
  }

  const handleSaveChanges = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/user/profile?userId=${encodeURIComponent(user.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: editedName,
          location: editedLocation,
          profile_picture_url: editedAvatar,
          bio: editedBio,
          experience_years: editedExperience ? Number.parseInt(editedExperience) : null,
          languages: editedLanguages,
          skills: editedSkills,
          portfolio_urls: editedPortfolio.map((item) => item.url),
          cv_url: editedCv.length > 0 ? editedCv[0].url : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const { profile } = await response.json()
      setUser(profile)
      setIsEditing(false)
      setIsProfileInfoModalOpen(false)
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to update profile")
    }
  }

  const handleCancel = () => {
    if (!user) return
    populateEditFields(user)
    setIsEditing(false)
  }

  const handleTabChange = (value: string) => {
    if (isEditing) {
      handleCancel()
      toast.warning("Exited edit mode. Changes were not saved.")
    }
    setActiveTab(value)
  }

  const handleAddItem = (type: "language" | "skill") => {
    if (type === "language" && newLanguageInputRef.current?.value) {
      setEditedLanguages([...editedLanguages, newLanguageInputRef.current.value])
      newLanguageInputRef.current.value = ""
    }
    if (type === "skill" && newSkillInputRef.current?.value) {
      setEditedSkills([...editedSkills, newSkillInputRef.current.value])
      newSkillInputRef.current.value = ""
    }
  }

  const handleRemoveItem = (type: "language" | "skill", item: string) => {
    if (type === "language") {
      setEditedLanguages(editedLanguages.filter((l) => l !== item))
    }
    if (type === "skill") {
      setEditedSkills(editedSkills.filter((s) => s !== item))
    }
  }

  const openPortfolioModal = (item: PortfolioItem | null) => {
    setCurrentPortfolioItem(item)
    setIsPortfolioModalOpen(true)
  }

  const handleSavePortfolioItem = (item: PortfolioItem) => {
    if (currentPortfolioItem) {
      setEditedPortfolio(editedPortfolio.map((p) => (p.id === item.id ? item : p)))
    } else {
      setEditedPortfolio([...editedPortfolio, { ...item, id: `p-${Date.now()}` }])
    }
    setIsPortfolioModalOpen(false)
  }

  const handleRemovePortfolioItem = (id: string) => {
    setEditedPortfolio(editedPortfolio.filter((item) => item.id !== id))
  }

  const openCvModal = (item: CVItem | null) => {
    setCurrentCvItem(item)
    setIsCvModalOpen(true)
  }

  const handleSaveCvItem = (item: CVItem) => {
    if (currentCvItem) {
      setEditedCv(editedCv.map((c) => (c.id === item.id ? item : c)))
    } else {
      setEditedCv([...editedCv, { ...item, id: `cv-${Date.now()}` }])
    }
    setIsCvModalOpen(false)
  }

  const handleRemoveCvItem = (id: string) => {
    setEditedCv(editedCv.filter((item) => item.id !== id))
  }

  const renderActionButton = () => {
    if (isEditing) {
      return (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-white text-black border-gray-300 rounded-full h-10 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-black text-white rounded-full h-10 hover:bg-black/90 shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={handleSaveChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )
    }
    return (
      <Button
        className="w-10 h-10 bg-white text-black rounded-full border border-gray-200 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200 p-0"
        onClick={() => setIsEditing(true)}
      >
        <Edit className="w-4 h-4" />
      </Button>
    )
  }

  const handleFileUpload = async (file: File, type: "profile" | "portfolio" | "cv") => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ }))
        throw new Error(errorData.error || "Failed to upload file")
      }

      const { url } = await response.json()
      return url
    } catch (error) {
      console.error("File upload error:", error)
      toast.error("Failed to upload file")
      return null
    }
  }

  const handleAvatarUpload = async (file: File) => {
    const url = await handleFileUpload(file, "profile")
    if (url) {
      setEditedAvatar(url)
      setEditedAvatarPreview(url)
    }
  }

  const handlePortfolioUpload = async (files: FileList) => {
    const uploadPromises = Array.from(files).map((file) => handleFileUpload(file, "portfolio"))
    const urls = await Promise.all(uploadPromises)
    const validUrls = urls.filter((url) => url !== null) as string[]

    const newPortfolioItems = validUrls.map((url) => ({
      id: Math.random().toString(),
      type: "image" as const,
      url,
      title: "Portfolio Image",
    }))

    setEditedPortfolio((prev) => [...prev, ...newPortfolioItems])
  }

  const handleCvUpload = async (file: File) => {
    const url = await handleFileUpload(file, "cv")
    if (url) {
      const newCvItem = {
        id: Math.random().toString(),
        title: file.name,
        url,
        uploadDate: new Date().toISOString(),
      }
      setEditedCv([newCvItem])
    }
  }

  if (isLoading) return <ProfileLoading />
  if (!user) return <div>Profile not found.</div>

  const TabButton = ({ value, label }: { value: string; label: string }) => (
    <TabsTrigger
      value={value}
      className={cn(
        "justify-center rounded-full text-sm font-medium flex items-center gap-2 h-8",
        "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-none data-[state=active]:border-0",
        "data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-500"
      )}
    >
      {label}
    </TabsTrigger>
  )

  const talentData = {
    id: user.id,
    name: user.full_name,
    role: user.roles?.[0] || "",
    location: user.location,
    avatar: user.profile_picture_url || "/logo-w-default.png",
    bio: user.bio || "",
    experience: user.experience_years?.toString() || "",
    languages: user.languages || [],
    skills: user.skills || [],
    portfolio: [],
    cv: [],
    rating: user.rating,
    reviews: user.total_reviews,
    verified: user.is_verified,
    availability: user.availability || "available",
  }

  return (
    <div className="min-h-screen bg-white antialiased font-sans">
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
        <div className="max-w-md mx-auto bg-white min-h-screen font-sans flex flex-col">
          <TopNav />

          <div className="pt-4 px-4">
            <div className="relative mb-4">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                    <Image
                      src={(user?.profile_picture_url as string) || "/logo-w-default.png"}
                      alt={`${user?.full_name || "Profile"} avatar`}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <h2 className="text-sm font-bold text-gray-900 mb-1">{user?.full_name}</h2>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Briefcase className="w-4 h-4 text-gray-600" />
                      {Array.isArray(user?.roles) && user.roles.length > 0 ? (
                        <div className="flex items-center gap-1 flex-wrap">
                          {user.roles.map((r: string, idx: number) => (
                            <Badge key={`${r}-${idx}`} variant="outline" className="font-normal capitalize text-xs py-px bg-transparent border-gray-300 text-gray-700">
                              {r.replace("-", " ")}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Role not specified</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span>{user?.location || "Location not specified"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="absolute top-2 right-2 mt-2 mr-2 w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                onClick={() => setIsProfileInfoModalOpen(true)}
              >
                <Settings className="h-4 w-4 text-black" />
              </button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="px-4 pb-2">
              <TabsList className="grid w-full grid-cols-4 gap-2 bg-gradient-to-r from-gray-50 to-white shadow-inner p-1 rounded-full">
                <TabButton value="bio" label="Bio" />
                <TabButton value="portfolio" label="Portfolio" />
                <TabButton value="cv" label="CV" />
                <TabButton value="availability" label="Availability" />
              </TabsList>
            </div>

            <div className="mt-4 px-4">
              <TabsContent value="bio" className="m-0 space-y-4">
                <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4">
                    <section className="mb-4">
                      <h3 className="font-semibold text-black mb-2">About</h3>
                      {isEditing ? (
                        <Textarea
                          value={editedBio}
                          onChange={(e) => setEditedBio(e.target.value)}
                          className="text-sm bg-white text-black border-gray-300"
                          rows={5}
                        />
                      ) : (
                        <p className="text-gray-800 text-sm leading-relaxed">{editedBio || "No bio available"}</p>
                      )}
                    </section>
                    <Separator className="my-4 bg-gray-200 h-px" />
                    <section className="mb-4">
                      <h3 className="font-semibold text-black mb-2">Experience</h3>
                      {isEditing ? (
                        <Input
                          value={editedExperience}
                          onChange={(e) => setEditedExperience(e.target.value)}
                          className="text-sm bg-white text-black border-gray-300"
                          placeholder="Years of experience"
                        />
                      ) : (
                        <p className="text-gray-800 text-sm">
                          {editedExperience ? `${editedExperience} years` : "No experience specified"}
                        </p>
                      )}
                    </section>
                    <Separator className="my-4 bg-gray-200 h-px" />
                    <section>
                      <h3 className="font-semibold text-black mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {editedLanguages.map((lang) => (
                          <Badge
                            key={lang}
                            variant="outline"
                            className="font-normal text-black border-gray-300 bg-white"
                          >
                            {lang}
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveItem("language", lang)}
                                className="ml-2 text-gray-500 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                      {isEditing && (
                        <div className="flex gap-2 mt-2">
                          <Input
                            ref={newLanguageInputRef}
                            placeholder="Add language"
                            className="bg-white border-gray-300"
                          />
                          <Button onClick={() => handleAddItem("language")}>Add</Button>
                        </div>
                      )}
                    </section>
                    <Separator className="my-4 bg-gray-200 h-px" />
                    <section>
                      <h3 className="font-semibold text-black mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {editedSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800">
                            {skill}
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveItem("skill", skill)}
                                className="ml-2 text-blue-600 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                      {isEditing && (
                        <div className="flex gap-2 mt-2">
                          <Input ref={newSkillInputRef} placeholder="Add skill" className="bg-white border-gray-300" />
                          <Button onClick={() => handleAddItem("skill")}>Add</Button>
                        </div>
                      )}
                    </section>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="portfolio" className="m-0">
                <div className="grid grid-cols-2 gap-2">
                  {editedPortfolio.map((item, index) => (
                    <div
                      key={item.id}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
                      onClick={() => {
                        if (isEditing) {
                          openPortfolioModal(item)
                        } else {
                          // navigate to portfolio viewer
                        }
                      }}
                    >
                      <Image
                        src={item.thumbnailUrl || "/placeholder.svg?height=400&width=400&query=portfolio-thumbnail"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      {isEditing && (
                        <>
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit className="w-6 h-6 text-white" />
                          </div>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full z-10"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemovePortfolioItem(item.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      className="aspect-square rounded-lg flex flex-col items-center justify-center gap-1 text-gray-500 border-2 border-dashed bg-transparent hover:bg-gray-50"
                      onClick={() => openPortfolioModal(null)}
                    >
                      <Plus className="w-6 h-6" />
                      <span className="text-xs">Add Item</span>
                    </button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="cv" className="m-0">
                <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {editedCv.map((job) => (
                        <div
                          key={job.id}
                          className="flex items-center gap-2 group cursor-pointer"
                          onClick={() => isEditing && openCvModal(job)}
                        >
                          <div className="flex-grow border-l-2 border-gray-200 pl-4 relative py-1">
                            <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full border-2 border-white"></div>
                            <p className="text-xs font-semibold text-gray-500">{job.year}</p>
                            <h5 className="font-semibold text-gray-800 text-sm">{job.project}</h5>
                            <p className="text-xs text-gray-600">
                              {job.role} - {job.producer}
                            </p>
                          </div>
                          {isEditing && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveCvItem(job.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <Button
                          variant="outline"
                          className="w-full border-dashed bg-transparent hover:bg-gray-50 text-black"
                          onClick={() => openCvModal(null)}
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add CV Entry
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="availability" className="m-0">
                <p className="text-sm text-gray-600 mb-4">Select the days you are available.</p>
                <div className="bg-transparent">
                  <Calendar
                    mode="multiple"
                    selected={editedDates}
                    onSelect={isEditing ? setEditedDates : undefined}
                    disabled={!isEditing}
                    className="p-0"
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="fixed bottom-16 left-0 right-0 z-40">
          <div className="max-w-md mx-auto px-6 py-4 flex justify-end pr-4">{renderActionButton()}</div>
        </div>
      </div>

      <ProfileInfoFormDialog
        isOpen={isProfileInfoModalOpen}
        onOpenChange={setIsProfileInfoModalOpen}
        talentData={{
          name: editedName,
          role: editedRole,
          location: editedLocation,
          avatarPreview: editedAvatarPreview,
        }}
        onSave={handleSaveChanges}
        setTalentData={(data) => {
          setEditedName(data.name)
          setEditedRole(data.role)
          setEditedLocation(data.location)
          if (data.avatarPreview) {
            setEditedAvatarPreview(data.avatarPreview)
            setEditedAvatar(data.avatarPreview)
          }
        }}
      />

      <PortfolioItemFormDialog
        isOpen={isPortfolioModalOpen}
        onOpenChange={setIsPortfolioModalOpen}
        item={currentPortfolioItem}
        onSave={handleSavePortfolioItem}
      />

      <CvItemFormDialog
        isOpen={isCvModalOpen}
        onOpenChange={setIsCvModalOpen}
        item={currentCvItem}
        onSave={handleSaveCvItem}
      />
    </div>
  )
}

// ... existing code for dialog components ...
function ProfileInfoFormDialog({
  isOpen,
  onOpenChange,
  talentData,
  onSave,
  setTalentData,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  talentData: { name: string; role: string; location: string; avatarPreview: string }
  onSave: () => void
  setTalentData: (data: { name: string; role: string; location: string; avatarPreview?: string }) => void
}) {
  const { name, role, location, avatarPreview } = talentData
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setTalentData({ name, role, location, avatarPreview: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-black">Edit Profile Info</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <Image
              src={avatarPreview || "/logo-w-default.png"}
              alt="Avatar Preview"
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover"
            />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <Button
              variant="default"
              className="bg-black text-white rounded-full hover:bg-gray-800"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Photo
            </Button>
          </div>
          <div className="space-y-1">
            <Label htmlFor="name" className="text-black">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setTalentData({ ...talentData, name: e.target.value })}
              className="bg-white text-black border-gray-300 rounded-md"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="role" className="text-black">
              Role
            </Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setTalentData({ ...talentData, role: e.target.value })}
              className="bg-white text-black border-gray-300 rounded-md"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="location" className="text-black">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setTalentData({ ...talentData, location: e.target.value })}
              className="bg-white text-black border-gray-300 rounded-md"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="rounded-full">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={onSave} className="rounded-full">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PortfolioItemFormDialog({
  isOpen,
  onOpenChange,
  item,
  onSave,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  item: PortfolioItem | null
  onSave: (item: PortfolioItem) => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [year, setYear] = useState("")
  const [role, setRole] = useState("")
  const [type, setType] = useState<"single" | "carousel">("single")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (item) {
      setTitle(item.title)
      setDescription(item.description)
      setYear(item.year)
      setRole(item.role)
      setType(item.type)
      setImageUrls(item.imageUrls)
      setImagePreviews(item.imageUrls)
    } else {
      setTitle("")
      setDescription("")
      setYear("")
      setRole("")
      setType("single")
      setImageUrls([])
      setImagePreviews([])
    }
  }, [item, isOpen])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files)
      const newPreviews = files.map((file) => URL.createObjectURL(file))
      if (type === "single") {
        setImagePreviews(newPreviews.slice(0, 1))
        setImageUrls(newPreviews.slice(0, 1))
      } else {
        setImagePreviews([...imagePreviews, ...newPreviews])
        setImageUrls([...imageUrls, ...newPreviews])
      }
    }
  }

  const handleSubmit = () => {
    onSave({
      id: item?.id || "",
      title,
      description,
      year,
      role,
      type,
      imageUrls,
      thumbnailUrl: imageUrls[0] || "",
      date: item?.date || new Date().toISOString().split("T")[0],
      category: item?.category || "",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-black">{item ? "Edit Portfolio Item" : "Add Portfolio Item"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="title" className="text-black">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white text-black border-gray-300 rounded-md"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="year" className="text-black">
              Year
            </Label>
            <Input
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-white text-black border-gray-300 rounded-md"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="role" className="text-black">
              Role
            </Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-white text-black border-gray-300 rounded-md"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description" className="text-black">
              Comment
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white text-black border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-center space-x-2 justify-end">
            <Label htmlFor="type-switch" className="text-black">
              Carousel
            </Label>
            <Switch
              id="type-switch"
              checked={type === "carousel"}
              onCheckedChange={(checked) => setType(checked ? "carousel" : "single")}
            />
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple={type === "carousel"}
              accept="image/*"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-black text-white rounded-md hover:bg-black/90"
            >
              <UploadCloud className="mr-2 h-4 w-4" /> Upload Image(s)
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((src, index) => (
              <Image
                key={index}
                src={src || "/placeholder.svg?height=80&width=80&query=portfolio-preview"}
                alt="preview"
                width={80}
                height={80}
                className="rounded-md object-cover"
              />
            ))}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="rounded-full">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} className="rounded-full">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CvItemFormDialog({
  isOpen,
  onOpenChange,
  item,
  onSave,
}: { isOpen: boolean; onOpenChange: (open: boolean) => void; item: CVItem | null; onSave: (item: CVItem) => void }) {
  const [project, setProject] = useState("")
  const [year, setYear] = useState("")
  const [role, setRole] = useState("")
  const [producer, setProducer] = useState("")

  useEffect(() => {
    if (item) {
      setProject(item.project)
      setYear(item.year)
      setRole(item.role)
      setProducer(item.producer)
    } else {
      setProject("")
      setYear("")
      setRole("")
      setProducer("")
    }
  }, [item, isOpen])

  const handleSubmit = () => {
    onSave({ id: item?.id || "", project, year, role, producer })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-black">{item ? "Edit CV Item" : "Add CV Item"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="project" className="text-black">
              Project
            </Label>
            <Input
              id="project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="bg-white text-black border-gray-300 rounded-md"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="year" className="text-black">
              Year
            </Label>
            <Input
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-white text-black border-gray-300 rounded-md"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="role" className="text-black">
              Role
            </Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-white text-black border-gray-300 rounded-md"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="producer" className="text-black">
              Producer
            </Label>
            <Input
              id="producer"
              value={producer}
              onChange={(e) => setProducer(e.target.value)}
              className="bg-white text-black border-gray-300 rounded-md"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="rounded-full">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} className="rounded-full">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
