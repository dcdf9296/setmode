"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Bell, MoreVertical, Send, MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getTalentBySlug, type Talent, type PortfolioItem } from "@/lib/data-store"
import ProfileLoading from "@/components/profile-loading"
import ModeSwitcher from "@/components/mode-switcher"
import { cn } from "@/lib/utils"

const jobsData = [
  { year: "2024", project: "Here After - L'aldilà", role: "Hair Stylist", producer: "Netflix Studios" },
  { year: "2024", project: "Fashion Week Milano", role: "Lead Stylist", producer: "Versace" },
  { year: "2024", project: "Versace Campaign", role: "Hair Stylist", producer: "Versace" },
  { year: "2023", project: "Vogue Photoshoot", role: "Hair Stylist", producer: "Condé Nast" },
  { year: "2023", project: "Bridal Stylist", role: "Bridal Stylist", producer: "Personal Productions" },
  { year: "2023", project: "Milan Fashion Week", role: "Backstage Stylist", producer: "Camera Moda" },
  { year: "2023", project: "Armani Show", role: "Lead Hair Artist", producer: "Giorgio Armani" },
]

export default function TalentProfilePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { id } = params
  const [talent, setTalent] = useState<Talent | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    bio: "",
    experience: "",
    languages: [] as string[],
    skills: [] as string[],
  })

  const fromBrowse = searchParams.get("from") === "browse"

  useEffect(() => {
    window.scrollTo(0, 0)
    if (typeof id === "string") {
      const fetchedTalent = getTalentBySlug(id)
      setTalent(fetchedTalent)
      if (fetchedTalent) {
        setEditForm({
          bio: fetchedTalent.bio,
          experience: fetchedTalent.experience,
          languages: [...fetchedTalent.languages],
          skills: [...fetchedTalent.skills],
        })
      }
    }
  }, [id])

  const handleSaveProfile = () => {
    if (talent) {
      // Update talent data (in a real app, this would be an API call)
      const updatedTalent = {
        ...talent,
        bio: editForm.bio,
        experience: editForm.experience,
        languages: editForm.languages,
        skills: editForm.skills,
      }
      setTalent(updatedTalent)
      setIsEditModalOpen(false)
    }
  }

  if (!talent) {
    return <ProfileLoading />
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen font-sans flex flex-col relative">
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

      {/* White header to mirror Job Details */}
      <header className="bg-white px-4 py-3 flex items-center justify-between h-16 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <ModeSwitcher />
          <button onClick={() => router.push("/notifications")} className="p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5 text-black" />
          </button>
          <button onClick={() => router.push("/menu")} className="p-2 rounded-full hover:bg-gray-100">
            <MoreVertical className="w-5 h-5 text-black" />
          </button>
        </div>
      </header>

      <div className="flex-grow overflow-y-auto pb-36 relative z-10">
        <div className="pt-4 flex flex-col items-center">
          <div className="relative mb-8 w-full px-4">
            <div className="relative bg-white rounded-2xl shadow-lg p-4 flex items-center gap-4">
              {/* Profile picture on the left */}
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-4 border-white flex-shrink-0">
                <Image
                  src={talent.avatar || "/placeholder.svg"}
                  alt={`${talent.name} avatar`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content aligned to the left */}
              <div className="flex-1 text-left">
                <h1 className="text-sm font-bold text-gray-900 mb-1">{talent.name}</h1>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600 capitalize">{talent.role.replace("-", " ")}</span>
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium text-gray-900">{talent.rating}</span>
                </div>
                <p className="text-sm text-gray-600">{talent.location}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="bio" className="w-full">
          <div className="px-4 pb-2">
            <TabsList className="w-full flex rounded-full p-1 m-0 bg-gradient-to-r from-gray-50 to-white shadow-inner py-2 gap-0 justify-center relative h-10">
              <TabsTrigger
                value="bio"
                className={cn(
                  "flex-1 justify-center rounded-full text-sm font-medium flex items-center gap-2 h-8",
                  "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-0 data-[state=active]:shadow-sm",
                  "data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:border-0",
                )}
              >
                Bio
              </TabsTrigger>
              <TabsTrigger
                value="portfolio"
                className={cn(
                  "flex-1 justify-center rounded-full text-sm font-medium flex items-center gap-2 h-8",
                  "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-0 data-[state=active]:shadow-sm",
                  "data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:border-0",
                )}
              >
                Portfolio
              </TabsTrigger>
              <TabsTrigger
                value="cv"
                className={cn(
                  "flex-1 justify-center rounded-full text-sm font-medium flex items-center gap-2 h-8",
                  "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-0 data-[state=active]:shadow-sm",
                  "data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:border-0",
                )}
              >
                CV
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-4 px-4">
            <TabsContent value="bio" className="m-0">
              <Card className="rounded-2xl bg-white shadow-lg">
                <CardContent className="p-4">
                  <section>
                    <h3 className="font-semibold text-black mb-2">About</h3>
                    <p className="text-gray-800 text-sm leading-relaxed">{talent.bio}</p>
                  </section>

                  <Separator className="my-4 bg-gray-200 h-px" />

                  <section>
                    <h3 className="font-semibold text-black mb-2">Experience</h3>
                    <p className="text-gray-800 text-sm">{talent.experience}</p>
                  </section>

                  <Separator className="my-4 bg-gray-200 h-px" />

                  <section>
                    <h3 className="font-semibold text-black mb-3">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {talent.languages.map((lang) => (
                        <Badge key={lang} variant="outline" className="font-normal text-black border-gray-300">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </section>

                  <Separator className="my-4 bg-gray-200 h-px" />

                  <section>
                    <h3 className="font-semibold text-black mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {talent.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </section>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio" className="m-0">
              <div className="grid grid-cols-2 gap-2">
                {talent.portfolio.map((item: PortfolioItem, index: number) => (
                  <div
                    key={item.id}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-gray-100"
                    onClick={() => router.push(`/talent/${talent.slug}/portfolio?index=${index}`)}
                  >
                    <Image
                      src={item.thumbnailUrl || "/placeholder.svg?width=200&height=200"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="cv" className="m-0">
              <Card className="rounded-2xl border border-gray-200 bg-white">
                <CardContent className="p-4">
                  <div className="space-y-6">
                    {jobsData.map((job, index) => (
                      <div key={index} className="border-l border-gray-200 pl-6 relative">
                        <div className="absolute -left-[2.5px] top-1 w-2 h-2 bg-black rounded-full border-2 border-white"></div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                                {job.year}
                              </span>
                              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                {job.role}
                              </span>
                            </div>
                            <h5 className="font-semibold text-gray-800 text-sm leading-tight">{job.project}</h5>
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className="text-xs text-gray-500 font-normal">produced by</p>
                            <p className="text-xs text-gray-800 font-bold">{job.producer}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {fromBrowse && (
        <div className="fixed bottom-16 left-0 right-0 z-[55]">
          <div className="max-w-md mx-auto px-4">
            <div className="bg-transparent rounded-t-xl px-4 py-3">
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-black text-white rounded-full h-10 hover:bg-black/90 text-sm shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() => router.push(`/invite-to-job?talentId=${talent.id}`)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Invite to Job
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-white text-black border-gray-300 rounded-full h-10 text-sm shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() => router.push(`/chat/${talent.id}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="max-w-md mx-auto w-full h-full flex flex-col">
            <header className="bg-white px-4 py-3 flex items-center justify-between h-16 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(false)} className="-ml-2">
                  <X className="w-5 h-5 text-black" />
                </Button>
                <h1 className="font-semibold text-lg text-black">Edit Profile</h1>
              </div>
              <Button onClick={handleSaveProfile} className="bg-black text-white hover:bg-gray-800 text-sm px-4">
                Save
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">About</label>
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Experience</label>
                <Textarea
                  value={editForm.experience}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, experience: e.target.value }))}
                  placeholder="Describe your experience..."
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Languages</label>
                <Input
                  value={editForm.languages.join(", ")}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, languages: e.target.value.split(", ").filter(Boolean) }))
                  }
                  placeholder="English, Italian, Spanish..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Skills</label>
                <Input
                  value={editForm.skills.join(", ")}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, skills: e.target.value.split(", ").filter(Boolean) }))
                  }
                  placeholder="Hair Styling, Makeup, Fashion..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
