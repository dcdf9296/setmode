"use client"
import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Check,
  Users,
  Bell,
  MoreVertical,
  Grid3X3,
  MessageCircle,
  Briefcase,
  User,
  Search,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter, useSearchParams } from "next/navigation"
import { getLists, getTalentById, addTalentToList, type TalentList, type Talent } from "@/lib/data-store"
import { toast } from "sonner"
import ModeSwitcher from "@/components/mode-switcher"

export default function AddToListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const talentId = searchParams.get("talent")
  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [expandedList, setExpandedList] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [userLists, setUserLists] = useState<TalentList[]>([])
  const [talent, setTalent] = useState<Talent | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setUserLists(getLists())
    if (talentId) {
      const talentData = getTalentById(talentId)
      setTalent(talentData || null)
    }
  }, [talentId])

  const handleBack = () => {
    router.back()
  }

  const handleListSelect = (listId: string) => {
    if (selectedLists.includes(listId)) {
      setSelectedLists(selectedLists.filter((id) => id !== listId))
      setExpandedList(null)
    } else {
      setSelectedLists([...selectedLists, listId])
      setExpandedList(listId)
    }
  }

  const handleNewList = () => {
    router.push("/create-list")
  }

  const handleSave = async () => {
    if (!talentId || selectedLists.length === 0) return

    setIsSubmitting(true)

    try {
      selectedLists.forEach((listId) => {
        addTalentToList(listId, talentId)
      })

      toast.success(`Added to ${selectedLists.length} list${selectedLists.length > 1 ? "s" : ""}!`)
      router.back()
    } catch (error) {
      toast.error("Failed to add to lists. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter lists based on search query
  const filteredLists = userLists.filter((list) => {
    if (!searchQuery) return true
    return list.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-white antialiased font-sans">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="bg-white px-4 py-3 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Button onClick={handleBack} variant="ghost" className="p-0">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
            <h1 className="text-lg font-bold text-black ml-2">Add to List</h1>
          </div>

          <div className="flex items-center gap-4">
            <ModeSwitcher />
            <Bell className="w-5 h-5 text-black" />
            <MoreVertical className="w-5 h-5 text-black" />
          </div>
        </header>

        {/* Search and New List Button */}
        <div className="px-4 py-4">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lists..."
                className="w-full pl-10 pr-4 py-3 bg-black border-0 rounded-full text-white placeholder-white focus:ring-0 focus:outline-none"
              />
            </div>
            <Button
              onClick={handleNewList}
              className="bg-black hover:bg-gray-800 text-white px-4 py-3 rounded-full text-sm font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              New List
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-2 pb-32">
          <div className="space-y-4">
            {filteredLists.map((list) => {
              const isSelected = selectedLists.includes(list.id)
              const isExpanded = expandedList === list.id

              return (
                <div key={list.id} className="space-y-2">
                  <div
                    onClick={() => handleListSelect(list.id)}
                    className={`bg-white rounded-2xl p-4 cursor-pointer transition-all ${isSelected ? "border-2 border-black" : "border border-gray-200"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{list.name}</h3>
                          <p className="text-sm text-gray-600">{list.talentIds.length} members</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded talents list - only show talents, no Add New button */}
                  {isSelected && isExpanded && (
                    <div className="ml-4 space-y-2">
                      {list.talentIds.slice(0, 3).map((talentId) => {
                        const talent = getTalentById(talentId)
                        if (!talent) return null

                        return (
                          <div key={talent.id} className="bg-white rounded-xl p-3 border border-gray-200">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={talent.avatar || "/placeholder.svg"} alt={talent.name} />
                                <AvatarFallback className="bg-gray-200 text-gray-600">
                                  {talent.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-gray-900 text-sm">{talent.name}</h4>
                                <p className="text-xs text-gray-600">{talent.role}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom Save Button */}
        {selectedLists.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 py-4 bg-white">
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-2xl font-semibold disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : `Add to ${selectedLists.length} List${selectedLists.length > 1 ? "s" : ""}`}
            </Button>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white z-40">
          <div className="flex justify-around items-center py-4 px-2">
            <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => router.push("/")}>
              <Grid3X3 className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400">Browse</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => router.push("/chat")}>
              <MessageCircle className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400">Chat</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => router.push("/my-jobs")}>
              <Briefcase className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400">Jobs</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400">Profile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
