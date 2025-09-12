"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Bell, MoreVertical, ListPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter, useSearchParams } from "next/navigation"
import ModeSwitcher from "@/components/mode-switcher"
import { getTalents, addTalentToList, type Talent } from "@/lib/data-store"
import { toast } from "sonner"

export default function BrowseContactsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listId = searchParams.get("listId")
  const [roleQuery, setRoleQuery] = useState("")
  const [locationQuery, setLocationQuery] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [allTalents, setAllTalents] = useState<Talent[]>([])

  useEffect(() => {
    setAllTalents(getTalents())
  }, [])

  const handleBack = () => {
    router.back()
  }

  const handleContactSelect = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId],
    )
  }

  const handleAddToList = () => {
    if (selectedContacts.length === 0) return

    if (listId) {
      selectedContacts.forEach((contactId) => {
        addTalentToList(listId, contactId)
      })
      toast.success(`Added ${selectedContacts.length} member(s) to the list.`)
      router.back()
    } else {
      const talentIds = selectedContacts.join(",")
      router.push(`/add-to-list?talents=${talentIds}`)
    }
  }

  const filteredContacts = allTalents.filter((contact) => {
    const matchesRole = contact.role.toLowerCase().includes(roleQuery.toLowerCase())
    const matchesLocation = contact.location.toLowerCase().includes(locationQuery.toLowerCase())
    return matchesRole && matchesLocation
  })

  return (
    <div className="min-h-screen bg-white antialiased font-sans">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="bg-white px-4 py-3 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            {/* Removed floating effect from back button */}
            <Button onClick={handleBack} variant="ghost" className="p-0">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
            <h1 className="text-lg font-bold text-black ml-2">Browse Contacts</h1>
          </div>
          <div className="flex items-center gap-4">
            <ModeSwitcher />
            <Bell className="w-5 h-5 text-black" />
            <MoreVertical className="w-5 h-5 text-black" />
          </div>
        </header>

        {/* Search Fields */}
        <div className="px-4 py-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={roleQuery}
                onChange={(e) => setRoleQuery(e.target.value)}
                placeholder="Search role..."
                className="w-full pl-10 pr-4 py-3 bg-black border-0 rounded-full text-white placeholder-gray-400 focus:ring-0 focus:outline-none"
              />
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Search location..."
                className="w-full pl-10 pr-4 py-3 bg-black border-0 rounded-full text-white placeholder-gray-400 focus:ring-0 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contacts List */}
        <div className="px-4 pb-24">
          <div className="space-y-0">
            {filteredContacts.map((contact, index) => {
              const isSelected = selectedContacts.includes(contact.id)
              return (
                <div
                  key={contact.id}
                  onClick={() => handleContactSelect(contact.id)}
                  className={`w-full p-4 cursor-pointer transition-all border-b border-gray-200 ${index === 0 ? "border-t border-gray-200" : ""} ${isSelected ? "bg-gradient-to-r from-blue-50 to-purple-50" : "bg-white hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-4 relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-lg">
                        {contact.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{contact.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{contact.role}</p>
                      <p className="text-xs text-gray-500 mb-2">{contact.location}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>⭐ {contact.rating}</span>
                        <span>{contact.rate} reviews</span>
                      </div>
                    </div>
                    {isSelected && <div className="w-4 h-4 bg-black rounded-full absolute top-0 right-0"></div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom Add to List Button */}
        {selectedContacts.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-40 max-w-md mx-auto">
            <div className="p-4">
              <Button
                onClick={handleAddToList}
                className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-full flex items-center justify-center gap-2"
              >
                <ListPlus className="w-4 h-4" />
                Add to List ({selectedContacts.length})
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
