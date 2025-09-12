"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  MapPin,
  Briefcase,
  Camera,
  FileText,
  Users,
  Phone,
  Mail,
  MessageCircle,
  Palette,
  Video,
  Music,
  Scissors,
  Shirt,
  Eye,
  Lightbulb,
  Megaphone,
  Wrench,
  Zap,
  Settings,
  Star,
  X,
  Sparkles,
} from "lucide-react"
// import BottomNavBar from "@/app/components/bottom-nav-bar"
import { toast } from "react-hot-toast"

import { createClient } from "@/lib/supabase/client"

interface RegistrationData {
  fullName: string
  email: string
  password: string
  phoneCountryCode: string
  phoneNumber: string
  roles: string[]
  location: string
  employmentStatus: "freelancer" | "employed" | ""
  companyName: string
  profilePicture: File | null
  profilePictureUrl: string
  profilePictureStorageUrl: string
  bio: string
  portfolioFiles: File[]
  portfolioUrls: string[]
  formattedPortfolio: any
  formattedCV: any
  cvFile: File | null
  cvUrl: string
  skills: string[]
  contacts: Contact[]
}

interface Contact {
  name: string
  phone?: string
  email?: string
  isRegistered?: boolean
}

const AVAILABLE_ROLES = [
  { name: "Hair Stylist", icon: Scissors, color: "text-pink-500" },
  { name: "Make-up Artist", icon: Palette, color: "text-purple-500" },
  { name: "Photographer", icon: Camera, color: "text-blue-500" },
  { name: "Videographer", icon: Video, color: "text-red-500" },
  { name: "Fashion Designer", icon: Shirt, color: "text-green-500" },
  { name: "Model", icon: Star, color: "text-yellow-500" },
  { name: "Stylist", icon: Eye, color: "text-indigo-500" },
  { name: "Creative Director", icon: Lightbulb, color: "text-orange-500" },
  { name: "Producer", icon: Megaphone, color: "text-teal-500" },
  { name: "Editor", icon: Settings, color: "text-gray-500" },
  { name: "Sound Engineer", icon: Music, color: "text-cyan-500" },
  { name: "Lighting Technician", icon: Zap, color: "text-amber-500" },
  { name: "Set Designer", icon: Wrench, color: "text-emerald-500" },
  { name: "Wardrobe Assistant", icon: Shirt, color: "text-rose-500" },
  { name: "Location Scout", icon: MapPin, color: "text-violet-500" },
  { name: "Casting Director", icon: Users, color: "text-lime-500" },
  { name: "Script Supervisor", icon: FileText, color: "text-slate-500" },
  { name: "Gaffer", icon: Lightbulb, color: "text-yellow-600" },
  { name: "Boom Operator", icon: Music, color: "text-blue-600" },
  { name: "Focus Puller", icon: Eye, color: "text-green-600" },
]

const AVAILABLE_SKILLS = [
  "Adobe Photoshop",
  "Adobe Lightroom",
  "Adobe Premiere Pro",
  "Adobe After Effects",
  "Final Cut Pro",
  "DaVinci Resolve",
  "Figma",
  "Sketch",
  "InDesign",
  "Illustrator",
  "Color Grading",
  "Retouching",
  "Portrait Photography",
  "Fashion Photography",
  "Wedding Photography",
  "Event Photography",
  "Product Photography",
  "Studio Lighting",
  "Natural Light",
  "Hair Cutting",
  "Hair Coloring",
  "Bridal Makeup",
  "Special Effects Makeup",
  "Fashion Styling",
  "Wardrobe Styling",
  "Set Design",
  "Prop Styling",
  "Creative Direction",
  "Brand Strategy",
  "Social Media",
  "Content Creation",
  "Video Editing",
  "Motion Graphics",
]

const COUNTRY_CODES = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+1", country: "CA", flag: "🇨🇦" },
  { code: "+44", country: "GB", flag: "🇬🇧" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+31", country: "NL", flag: "🇳🇱" },
  { code: "+41", country: "CH", flag: "🇨🇭" },
  { code: "+43", country: "AT", flag: "🇦🇹" },
  { code: "+32", country: "BE", flag: "🇧🇪" },
  { code: "+45", country: "DK", flag: "🇩🇰" },
  { code: "+46", country: "SE", flag: "🇸🇪" },
  { code: "+47", country: "NO", flag: "🇳🇴" },
  { code: "+358", country: "FI", flag: "🇫🇮" },
  { code: "+351", country: "PT", flag: "🇵🇹" },
  { code: "+30", country: "GR", flag: "🇬🇷" },
  { code: "+48", country: "PL", flag: "🇵🇱" },
  { code: "+420", country: "CZ", flag: "🇨🇿" },
  { code: "+36", country: "HU", flag: "🇭🇺" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+64", country: "NZ", flag: "🇳🇿" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
  { code: "+54", country: "AR", flag: "🇦🇷" },
  { code: "+56", country: "CL", flag: "🇨🇱" },
]

export default function RegistrationPage() {
  console.log("[v0] RegisterPage component rendering")

  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<RegistrationData>({
    fullName: "",
    email: "",
    password: "",
    phoneCountryCode: "+1",
    phoneNumber: "",
    roles: [],
    location: "",
    employmentStatus: "",
    companyName: "",
    profilePicture: null,
    profilePictureUrl: "",
    profilePictureStorageUrl: "",
    bio: "",
    portfolioFiles: [],
    portfolioUrls: [],
    formattedPortfolio: null,
    formattedCV: null,
    cvFile: null,
    cvUrl: "",
    skills: [],
    contacts: [],
  })
  const [emailError, setEmailError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [registrationError, setRegistrationError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [registeredContacts, setRegisteredContacts] = useState<Contact[]>([])
  const [unregisteredContacts, setUnregisteredContacts] = useState<Contact[]>([])
  const [customSkill, setCustomSkill] = useState("")
  const [isFormatting, setIsFormatting] = useState(false)
  const [showFormattingPreview, setShowFormattingPreview] = useState(false)
  const [formattingType, setFormattingType] = useState<"portfolio" | "cv" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{6,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (!data.fullName.trim()) return
      if (!validateEmail(data.email)) {
        setEmailError("Please enter a valid email address")
        return
      }
      if (!validatePassword(data.password)) {
        setPasswordError("Password must be at least 6 characters long")
        return
      }
      if (!validatePhone(data.phoneNumber)) {
        setPhoneError("Please enter a valid phone number")
        return
      }
      setEmailError("")
      setPasswordError("")
      setPhoneError("")
    }
    if (currentStep === 2 && data.roles.length === 0) return
    if (currentStep === 3 && !data.location.trim()) return
    if (currentStep === 4 && !data.employmentStatus) return
    if (currentStep === 4 && data.employmentStatus === "employed" && !data.companyName.trim()) return

    setCurrentStep((prev) => Math.min(prev + 1, 7))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const toggleRole = (role: string) => {
    setData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
    }))
  }

  const toggleSkill = (skill: string) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }))
  }

  const formatDocument = async (file: File, type: "portfolio" | "cv") => {
    setIsFormatting(true)
    setFormattingType(type)

    try {
      // Extract text from file (simplified - in production you'd use proper PDF/DOC parsing)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const fileContent = e.target?.result as string

        const response = await fetch("/api/format-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileContent,
            fileType: file.type,
            documentType: type,
          }),
        })

        const result = await response.json()

        if (result.success) {
          if (type === "portfolio") {
            setData((prev) => ({ ...prev, formattedPortfolio: result.formattedData }))
          } else {
            setData((prev) => ({ ...prev, formattedCV: result.formattedData }))
          }
          setShowFormattingPreview(true)
        } else {
          alert("Failed to format document. Please try again.")
        }

        setIsFormatting(false)
      }

      reader.readAsText(file)
    } catch (error) {
      console.error("Formatting error:", error)
      alert("Failed to format document. Please try again.")
      setIsFormatting(false)
    }
  }

  const handleFileUpload = async (file: File, type: "profile" | "portfolio" | "cv" | "csv") => {
    if (type === "csv") {
      setCsvFile(file)
      // Parse CSV file
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.split("\n")
        const contacts: Contact[] = []

        lines.forEach((line, index) => {
          if (index === 0) return // Skip header
          const [name, phone, email] = line.split(",").map((s) => s.trim())
          if (name) {
            contacts.push({ name, phone, email })
          }
        })

        setData((prev) => ({ ...prev, contacts }))
        checkContacts(contacts)
      }
      reader.readAsText(file)
      return
    }

    if (type === "portfolio" || type === "cv") {
      // First upload the file
      try {
        console.log("[v0] Starting file upload for type:", type, "file:", file.name)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", type)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()
        console.log("[v0] Upload response:", result)

        if (!response.ok) {
          console.error("[v0] Upload error:", result.error)
          alert(`Upload failed: ${result.error}`)
          return
        }

        const publicUrl = result.url

        if (type === "portfolio") {
          setData((prev) => ({
            ...prev,
            portfolioFiles: [...prev.portfolioFiles, file],
            portfolioUrls: [...prev.portfolioUrls, publicUrl],
          }))
        } else if (type === "cv") {
          setData((prev) => ({
            ...prev,
            cvFile: file,
            cvUrl: publicUrl,
          }))
        }

        // Then trigger AI formatting
        await formatDocument(file, type)
      } catch (error) {
        console.error("[v0] File upload error:", error)
        alert("Upload failed. Please try again.")
      }
      return
    }

    try {
      console.log("[v0] Starting file upload for type:", type, "file:", file.name)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      console.log("[v0] Upload response:", result)

      if (!response.ok) {
        console.error("[v0] Upload error:", result.error)
        alert(`Upload failed: ${result.error}`)
        return
      }

      const publicUrl = result.url

      if (type === "profile") {
        const previewUrl = URL.createObjectURL(file)
        console.log("[v0] Setting profile picture URL:", publicUrl)
        setData((prev) => ({
          ...prev,
          profilePicture: file,
          profilePictureUrl: previewUrl,
          profilePictureStorageUrl: publicUrl,
        }))
      } else if (type === "portfolio") {
        setData((prev) => ({
          ...prev,
          portfolioFiles: [...prev.portfolioFiles, file],
          portfolioUrls: [...prev.portfolioUrls, publicUrl],
        }))
      } else if (type === "cv") {
        setData((prev) => ({
          ...prev,
          cvFile: file,
          cvUrl: publicUrl,
        }))
      }
    } catch (error) {
      console.error("[v0] File upload error:", error)
      alert("Upload failed. Please try again.")
    }
  }

  const addCustomSkill = () => {
    if (customSkill.trim() && !data.skills.includes(customSkill.trim())) {
      setData((prev) => ({
        ...prev,
        skills: [...prev.skills, customSkill.trim()],
      }))
      setCustomSkill("")
    }
  }

  const checkContacts = async (contacts: Contact[]) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/check-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts }),
      })
      const result = await response.json()
      setRegisteredContacts(result.registered || [])
      setUnregisteredContacts(result.unregistered || [])
    } catch (error) {
      console.error("Error checking contacts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvite = (method: "whatsapp" | "sms" | "email", contacts: Contact[]) => {
    const message = "Join me on our amazing platform! Download the app here: [APP_LINK]"

    if (method === "whatsapp") {
      const phoneNumbers = contacts
        .map((c) => c.phone)
        .filter(Boolean)
        .join(",")
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`)
    } else if (method === "sms") {
      const phoneNumbers = contacts
        .map((c) => c.phone)
        .filter(Boolean)
        .join(",")
      window.open(`sms:${phoneNumbers}?body=${encodeURIComponent(message)}`)
    } else if (method === "email") {
      const emails = contacts
        .map((c) => c.email)
        .filter(Boolean)
        .join(",")
      window.open(`mailto:${emails}?subject=Join me on our platform&body=${encodeURIComponent(message)}`)
    }
  }

  const handleSubmit = async () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
      return
    }

    try {
      console.log("[v0] Starting registration submission...")
      setIsSubmitting(true)

      const registrationData = {
        email: data.email,
        password: data.password, // Added password field for registration
        fullName: data.fullName,
        phone: data.phone,
        roles: data.roles,
        location: data.location,
        employmentStatus: data.employmentStatus,
        companyName: data.companyName,
        bio: data.bio,
        skills: data.skills,
        profilePictureUrl: data.profilePictureUrl,
        portfolioUrls: data.portfolioUrls,
        cvUrl: data.cvUrl,
        contacts: data.contacts,
      }

      console.log("[v0] Submitting registration data:", {
        email: registrationData.email,
        fullName: registrationData.fullName,
      })

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      })

      const result = await response.json()
      console.log("[v0] Registration response:", result)

      if (result.success) {
        console.log("[v0] Registration successful, storing session...")

        if (typeof window !== "undefined" && result.user) {
          const sessionData = {
            id: result.user.id,
            email: result.user.email,
            full_name: result.user.full_name,
            phone: `${data.phoneCountryCode}${data.phoneNumber}`,
            roles: data.roles,
            location: data.location,
            employment_status: data.employmentStatus,
            company_name: data.companyName,
            bio: data.bio,
            skills: data.skills,
            profile_picture_url: data.profilePictureStorageUrl,
          }
          localStorage.setItem("auth_session", JSON.stringify(sessionData))
        }

        toast.success("Registration completed successfully!")

        setTimeout(() => {
          window.location.href = "/home-hirer"
        }, 1000)
      } else {
        console.error("[v0] Registration failed:", result.message)
        toast.error(result.message || "Registration failed. Please try again.")
        setCurrentStep(1) // Reset to first step on error
      }
    } catch (error) {
      console.error("[v0] Registration error:", error)
      toast.error("Registration failed. Please try again.")
      setCurrentStep(1) // Reset to first step on error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    if (currentStep === 5) {
      setCurrentStep(6)
    }
  }

  const renderStep = () => {
    if (showFormattingPreview && (data.formattedPortfolio || data.formattedCV)) {
      return (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              AI Formatted {formattingType === "portfolio" ? "Portfolio" : "CV"}
            </h1>
            <p className="text-muted-foreground text-lg">Review and adjust your formatted content</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border">
            {formattingType === "portfolio" && data.formattedPortfolio && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{data.formattedPortfolio.title}</h3>
                  <p className="text-muted-foreground">{data.formattedPortfolio.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Projects</h4>
                  <div className="space-y-4">
                    {data.formattedPortfolio.projects?.map((project: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h5 className="font-medium">{project.name}</h5>
                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.technologies?.map((tech: string, i: number) => (
                            <span key={i} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {formattingType === "cv" && data.formattedCV && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">{data.formattedCV.personalInfo?.name}</h3>
                  <p className="text-muted-foreground">{data.formattedCV.personalInfo?.summary}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Experience</h4>
                  <div className="space-y-4">
                    {data.formattedCV.experience?.map((exp: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h5 className="font-medium">
                          {exp.role} at {exp.company}
                        </h5>
                        <p className="text-sm text-muted-foreground">{exp.duration}</p>
                        <p className="text-sm mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowFormattingPreview(false)
                setFormattingType(null)
              }}
              className="flex-1"
            >
              Edit Manually
            </Button>
            <Button
              onClick={() => {
                setShowFormattingPreview(false)
                setFormattingType(null)
                // Continue with formatted data
              }}
              className="flex-1 bg-gradient-to-r from-gray-900 to-gray-700 text-white"
            >
              Use AI Format
            </Button>
          </div>
        </div>
      )
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto flex items-center justify-center">
                <img src="/logo-homepage.png" alt="Logo" width={80} height={80} className="object-contain" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Welcome!</h1>
              <p className="text-muted-foreground text-lg">Let's get started with your basic information</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base font-medium">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={data.fullName}
                  onChange={(e) => setData((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  className="h-14 text-base rounded-full border-0 bg-white shadow-lg focus:shadow-xl transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => {
                    setData((prev) => ({ ...prev, email: e.target.value }))
                    setEmailError("")
                    setRegistrationError("")
                  }}
                  placeholder="Enter your email address"
                  className="h-14 text-base rounded-full border-0 bg-white shadow-lg focus:shadow-xl transition-shadow"
                />
                {emailError && <p className="text-destructive text-sm">{emailError}</p>}
                {registrationError && <p className="text-destructive text-sm">{registrationError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={(e) => {
                    setData((prev) => ({ ...prev, password: e.target.value }))
                    setPasswordError("")
                  }}
                  placeholder="Enter your password"
                  className="h-14 text-base rounded-full border-0 bg-white shadow-lg focus:shadow-xl transition-shadow"
                />
                {passwordError && <p className="text-destructive text-sm">{passwordError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-medium">
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={data.phoneCountryCode}
                    onChange={(e) => setData((prev) => ({ ...prev, phoneCountryCode: e.target.value }))}
                    className="w-24 h-14 rounded-full border-0 bg-white shadow-lg focus:shadow-xl transition-shadow"
                  >
                    <SelectTrigger className="w-24 h-14 rounded-full border-0 bg-white shadow-lg focus:shadow-xl transition-shadow">
                      <SelectValue placeholder="Select country code" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.code}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    value={data.phoneNumber}
                    onChange={(e) => {
                      setData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                      setPhoneError("")
                    }}
                    placeholder="Enter your phone number"
                    className="flex-1 h-14 text-base rounded-full border-0 bg-white shadow-lg focus:shadow-xl transition-shadow"
                  />
                </div>
                {phoneError && <p className="text-destructive text-sm">{phoneError}</p>}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Briefcase className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">What do you do?</h1>
              <p className="text-muted-foreground text-lg">Select all roles that apply to you</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {AVAILABLE_ROLES.map((role) => {
                const IconComponent = role.icon
                return (
                  <Badge
                    key={role.name}
                    variant={data.roles.includes(role.name) ? "default" : "outline"}
                    className={`p-4 cursor-pointer transition-all rounded-xl text-sm font-medium flex items-center gap-3 ${
                      data.roles.includes(role.name)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border-2 hover:border-primary hover:bg-primary/5"
                    }`}
                    onClick={() => toggleRole(role.name)}
                  >
                    <IconComponent
                      className={`w-5 h-5 ${data.roles.includes(role.name) ? "text-white" : role.color}`}
                    />
                    {role.name}
                  </Badge>
                )
              })}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Where are you located?</h1>
              <p className="text-muted-foreground text-lg">This helps us connect you with nearby opportunities</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-base font-medium">
                Location
              </Label>
              <Input
                id="location"
                value={data.location}
                onChange={(e) => setData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Enter your city, state/country"
                className="h-14 text-base rounded-full border-0 bg-white shadow-lg focus:shadow-xl transition-shadow"
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Briefcase className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Employment Status</h1>
              <p className="text-muted-foreground text-lg">Tell us about your current work situation</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 rounded-xl border-2 hover:border-primary cursor-pointer">
                <input
                  type="radio"
                  id="freelancer"
                  name="employmentStatus"
                  value="freelancer"
                  checked={data.employmentStatus === "freelancer"}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, employmentStatus: e.target.value as "freelancer" | "employed" }))
                  }
                  className="h-4 w-4 text-primary bg-background rounded-full border-2 focus:ring-2 focus:ring-primary"
                />
                <Label htmlFor="freelancer" className="text-base font-medium cursor-pointer flex-1">
                  Freelancer / Self-employed
                </Label>
              </div>
              <div className="flex items-center space-x-4 p-4 rounded-xl border-2 hover:border-primary cursor-pointer">
                <input
                  type="radio"
                  id="employed"
                  name="employmentStatus"
                  value="employed"
                  checked={data.employmentStatus === "employed"}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, employmentStatus: e.target.value as "freelancer" | "employed" }))
                  }
                  className="h-4 w-4 text-primary bg-background rounded-full border-2 focus:ring-2 focus:ring-primary"
                />
                <Label htmlFor="employed" className="text-base font-medium cursor-pointer flex-1">
                  Employed by a company
                </Label>
              </div>
            </div>

            {data.employmentStatus === "employed" && (
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-base font-medium">
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) => setData((prev) => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter your company name"
                  className="h-14 text-base rounded-full border-0 bg-white shadow-lg focus:shadow-xl transition-shadow"
                />
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Camera className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Complete Your Profile</h1>
              <p className="text-muted-foreground text-lg">Add some personal touches (all optional)</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Profile Picture</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setData((prev) => ({
                        ...prev,
                        profilePicture: null,
                        profilePictureUrl: "",
                        profilePictureStorageUrl: "",
                      }))
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Skip
                  </Button>
                </div>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-full cursor-pointer hover:border-primary relative overflow-hidden">
                    {data.profilePictureUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={data.profilePictureUrl || "/placeholder.svg"}
                          alt="Profile preview"
                          className="w-full h-full object-cover rounded-full"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground text-center">Upload a photo</p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          console.log("[v0] File selected:", file.name, file.size, file.type)
                          handleFileUpload(file, "profile")
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Skills</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setData((prev) => ({ ...prev, skills: [] }))
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Skip
                  </Button>
                </div>

                <div className="flex gap-2 mb-4">
                  <Input
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add custom skill..."
                    className="flex-1 h-10 text-sm rounded-full border-0 bg-white shadow-md focus:shadow-lg transition-shadow"
                    onKeyPress={(e) => e.key === "Enter" && addCustomSkill()}
                  />
                  <Button
                    onClick={addCustomSkill}
                    size="sm"
                    className="rounded-full px-4"
                    disabled={!customSkill.trim()}
                  >
                    Add
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {AVAILABLE_SKILLS.map((skill) => (
                    <Badge
                      key={skill}
                      variant={data.skills.includes(skill) ? "default" : "outline"}
                      className={`p-2 text-center cursor-pointer transition-all rounded-lg text-xs font-medium ${
                        data.skills.includes(skill)
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border hover:border-primary hover:bg-primary/5"
                      }`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                {data.skills.filter((skill) => !AVAILABLE_SKILLS.includes(skill)).length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground mb-2">Your custom skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {data.skills
                        .filter((skill) => !AVAILABLE_SKILLS.includes(skill))
                        .map((skill) => (
                          <Badge
                            key={skill}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                            onClick={() => toggleSkill(skill)}
                          >
                            {skill}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio" className="text-base font-medium">
                    Bio
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setData((prev) => ({ ...prev, bio: "" }))
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Skip
                  </Button>
                </div>
                <Textarea
                  id="bio"
                  value={data.bio}
                  onChange={(e) => setData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="min-h-24 text-base rounded-2xl border-0 bg-white shadow-lg focus:shadow-xl transition-shadow resize-none"
                />
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Portfolio & CV</h1>
              <p className="text-muted-foreground text-lg">Upload and let AI format for consistency</p>
            </div>

            {isFormatting && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">AI is formatting your {formattingType}...</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Portfolio</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setData((prev) => ({ ...prev, portfolioFiles: [], portfolioUrls: [], formattedPortfolio: null }))
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Skip
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-xl cursor-pointer hover:border-primary">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center mb-2">
                          <Sparkles className="w-5 h-5 mr-2 text-primary" />
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          Upload portfolio (PDF/Images)
                          <br />
                          <span className="text-primary text-xs">AI will format for consistency</span>
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,image/*"
                        multiple
                        onChange={(e) => {
                          if (e.target.files) {
                            Array.from(e.target.files).forEach((file) => handleFileUpload(file, "portfolio"))
                          }
                        }}
                      />
                    </label>
                  </div>
                  {data.portfolioUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {data.portfolioUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Portfolio ${index + 1}`}
                            className="object-cover rounded-lg"
                          />
                          <button
                            onClick={() => {
                              setData((prev) => ({
                                ...prev,
                                portfolioUrls: prev.portfolioUrls.filter((_, i) => i !== index),
                                portfolioFiles: prev.portfolioFiles.filter((_, i) => i !== index),
                              }))
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">CV/Resume</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setData((prev) => ({ ...prev, cvFile: null, cvUrl: "", formattedCV: null }))
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Skip
                  </Button>
                </div>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-xl cursor-pointer hover:border-primary">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center mb-2">
                        <Sparkles className="w-5 h-5 mr-2 text-primary" />
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        {data.cvFile ? data.cvFile.name : "Upload CV/Resume (PDF/DOC)"}
                        <br />
                        <span className="text-primary text-xs">AI will format for consistency</span>
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "cv")}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Import Contacts</h1>
              <p className="text-muted-foreground text-lg">Connect with people you know</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <Button
                  variant="outline"
                  className="h-16 text-base rounded-xl border-2 hover:border-primary bg-transparent"
                  onClick={() => {
                    alert("Phone contacts import requires mobile app")
                  }}
                >
                  <Phone className="w-5 h-5 mr-3" />
                  Import from Phone Contacts
                </Button>

                <div className="space-y-2">
                  <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-muted-foreground/25 rounded-xl cursor-pointer hover:border-primary">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 mr-3" />
                      <span className="text-base">Import from CSV File</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "csv")}
                    />
                  </label>
                </div>
              </div>

              {(registeredContacts.length > 0 || unregisteredContacts.length > 0) && (
                <div className="space-y-6">
                  {registeredContacts.length > 0 && (
                    <div className="p-6 rounded-xl">
                      <h3 className="text-lg font-semibold mb-4 text-green-600">
                        Already Registered ({registeredContacts.length})
                      </h3>
                      <div className="space-y-3">
                        {registeredContacts.slice(0, 3).map((contact, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="font-medium">{contact.name}</span>
                            <Button size="sm" className="rounded-full">
                              Start Chat
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {unregisteredContacts.length > 0 && (
                    <div className="p-6 rounded-xl">
                      <h3 className="text-lg font-semibold mb-4">Not Registered ({unregisteredContacts.length})</h3>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 rounded-full"
                            onClick={() => handleInvite("whatsapp", unregisteredContacts)}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-full bg-transparent"
                            onClick={() => handleInvite("sms", unregisteredContacts)}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            SMS
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-full bg-transparent"
                            onClick={() => handleInvite("email", unregisteredContacts)}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {unregisteredContacts.slice(0, 3).map((contact, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <span className="font-medium">{contact.name}</span>
                              <Button size="sm" variant="outline" className="rounded-full bg-transparent">
                                Invite
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getCurrentMode = () => {
    // Default to talent mode for now, can be enhanced later with mode selection
    return "talent"
  }

  console.log("[v0] Current step:", currentStep)

  return (
    <div className="min-h-screen bg-background">
      <div style={{ display: "none" }}>Registration Page Loaded - Step {currentStep}</div>

      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Step {currentStep} of 7</span>
            <span className="text-sm font-medium text-muted-foreground">{Math.round((currentStep / 7) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-8 pb-32">
        <div className="max-w-md mx-auto">{renderStep()}</div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white w-full pt-8 p-6 pb-8">
        <div className="max-w-md mx-auto flex gap-4">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 text-base rounded-full border-2 bg-white text-black shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              disabled={isLoading}
            >
              Back
            </Button>
          )}

          {currentStep < 7 ? (
            <Button
              onClick={handleNext}
              className="flex-1 h-12 text-base rounded-full bg-gradient-to-r from-gray-900 to-black text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0 hover:scale-105 hover:from-gray-800 hover:to-gray-900"
              disabled={isLoading}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="flex-1 h-12 text-base rounded-full bg-gradient-to-r from-gray-900 to-black text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0 hover:scale-105 hover:from-gray-800 hover:to-gray-900"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Complete Registration"}
            </Button>
          )}
        </div>
      </div>

      {/* <BottomNavBar /> */}
    </div>
  )
}
