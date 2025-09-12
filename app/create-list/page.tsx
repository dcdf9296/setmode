"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Bell, MoreVertical, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter, useSearchParams } from "next/navigation"
import { saveList, generateId, getTalents, getTalentById, type Talent } from "@/lib/data-store"
import { toast } from "sonner"
import ModeSwitcher from "@/components/mode-switcher"

export default function CreateListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedTalentId = searchParams.get("talent")

  const [listName, setListName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTalents, setSelectedTalents] = useState<Talent[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [availableTalents, setAvailableTalents] = useState<Talent[]>([])

  useEffect(() => {
    const talents = getTalents()
    setAvailableTalents(talents)

    // If there's a pre-selected talent, add it to the list
    if (preSelectedTalentId) {
      const talent = getTalentById(preSelectedTalentId)
      if (talent) {
        setSelectedTalents([talent])
      }
    }
  }, [preSelectedTalentId])

  const handleBack = () => {
    router.back()
  }

  const handleSubmit = async () => {
    if (!listName.trim()) {
      toast.error("List name cannot be empty.")
      return
    }

    setIsSubmitting(true)
    try {
      const newList = {
        id: generateId(),
        name: listName.trim(),
        talentIds: selectedTalents.map((t) => t.id),
        description: "",
        createdAt: new Date().toISOString(),
      }

      saveList(newList)
      toast.success(`List "${listName}" created successfully!`)
      router.push("/chat")
    } catch (error) {
      toast.error("Failed to create list. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTalentSelection = (talent: Talent) => {
    setSelectedTalents((prev) => {
      const isSelected = prev.some((t) => t.id === talent.id)
      if (isSelected) {
        return prev.filter((t) => t.id !== talent.id)
      } else {
        return [...prev, talent]
      }
    })
  }

  const filteredTalents = availableTalents.filter(
    (talent) =>
      talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-white antialiased font-sans">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="bg-white px-4 py-3 flex items-center justify-between h-16">
          <div className="flex items-center gap-1">
            <Button onClick={handleBack} variant="ghost" className="p-0">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
            <h1 className="text-black font-bold ml-2" style={{ fontSize: "18px" }}>
              New List
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ModeSwitcher />
            <Bell className="w-5 h-5 text-black" />
            <MoreVertical className="w-5 h-5 text-black" />
          </div>
        </header>

        {/* Form */}
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <label htmlFor="listName" className="text-base font-bold text-gray-700">
              List Name
            </label>
            <Input
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g. Top Hair Stylists for Milan"
              className="w-full bg-white text-black rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 placeholder:text-gray-500"
            />
          </div>

          {/* Show selected talent if pre-selected, otherwise show browse talents */}
          {preSelectedTalentId && selectedTalents.length > 0 ? (
            <div className="space-y-2">
              <label className="text-base font-bold text-gray-700">First Member</label>
              <div className="bg-white rounded-2xl border border-gray-300 p-4">
                {selectedTalents.map((talent) => (
                  <div key={talent.id} className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={talent.avatar || "/placeholder.svg"} alt={talent.name} />
                      <AvatarFallback className="bg-gray-200 text-gray-600">
                        {talent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{talent.name}</h3>
                      <p className="text-xs text-gray-600">{talent.role}</p>
                      <p className="text-xs text-gray-500">{talent.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-base font-bold text-gray-700">Browse Talents</label>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search talents..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-full text-black placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Talent List */}
              <div className="bg-white rounded-2xl border border-gray-300 max-h-60 overflow-y-auto">
                {filteredTalents.map((talent) => {
                  const isSelected = selectedTalents.some((t) => t.id === talent.id)
                  return (
                    <div
                      key={talent.id}
                      onClick={() => toggleTalentSelection(talent)}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={talent.avatar || "/placeholder.svg"} alt={talent.name} />
                        <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                          {talent.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{talent.name}</h3>
                        <p className="text-xs text-gray-600">{talent.role}</p>
                        <p className="text-xs text-gray-500">{talent.location}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {selectedTalents.length > 0 && (
                <div className="text-sm text-gray-600">
                  {selectedTalents.length} talent{selectedTalents.length !== 1 ? "s" : ""} selected
                </div>
              )}
            </div>
          )}

          <div className="pt-6">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !listName.trim()}
              className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-full text-sm font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create List"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
