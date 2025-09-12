"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Users, Phone, Mail, MessageCircle, FileText, Plus, Send, Check, Download } from "lucide-react"
import { toast } from "sonner"
import TopNav from "@/app/components/top-nav"

interface Contact {
  id?: string
  name: string
  phone?: string
  email?: string
  source?: string
  isRegistered?: boolean
  created_at?: string
}

interface Invitation {
  id: string
  contact_name: string
  contact_phone?: string
  contact_email?: string
  method: string
  status: string
  sent_at: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [registeredContacts, setRegisteredContacts] = useState<Contact[]>([])
  const [unregisteredContacts, setUnregisteredContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("import")

  // Dialog states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [inviteMethod, setInviteMethod] = useState<"whatsapp" | "sms" | "email">("whatsapp")
  const [customMessage, setCustomMessage] = useState("")

  // Add contact form
  const [newContact, setNewContact] = useState({ name: "", phone: "", email: "" })

  useEffect(() => {
    loadContacts()
    loadInvitations()
  }, [])

  const loadContacts = async () => {
    try {
      const response = await fetch("/api/import-contacts")
      if (response.ok) {
        const { contacts } = await response.json()
        setContacts(contacts || [])
        await checkContactsRegistration(contacts || [])
      }
    } catch (error) {
      console.error("Error loading contacts:", error)
    }
  }

  const loadInvitations = async () => {
    try {
      const response = await fetch("/api/send-invites")
      if (response.ok) {
        const { invites } = await response.json()
        setInvitations(invites || [])
      }
    } catch (error) {
      console.error("Error loading invitations:", error)
    }
  }

  const checkContactsRegistration = async (contactsToCheck: Contact[]) => {
    try {
      const response = await fetch("/api/check-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: contactsToCheck }),
      })

      if (response.ok) {
        const { registered, unregistered } = await response.json()
        setRegisteredContacts(registered || [])
        setUnregisteredContacts(unregistered || [])
      }
    } catch (error) {
      console.error("Error checking contacts:", error)
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result as string
        const lines = text.split("\n")
        const parsedContacts: Contact[] = []

        lines.forEach((line, index) => {
          if (index === 0) return // Skip header
          const [name, phone, email] = line.split(",").map((s) => s.trim())
          if (name) {
            parsedContacts.push({ name, phone, email, source: "csv" })
          }
        })

        if (parsedContacts.length > 0) {
          const response = await fetch("/api/import-contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contacts: parsedContacts, source: "csv" }),
          })

          if (response.ok) {
            const result = await response.json()
            toast.success(`Imported ${result.contactCount} contacts successfully!`)
            await loadContacts()
          } else {
            toast.error("Failed to import contacts")
          }
        }
      }
      reader.readAsText(file)
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to process file")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddContact = async () => {
    if (!newContact.name.trim()) {
      toast.error("Name is required")
      return
    }

    try {
      const response = await fetch("/api/import-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: [{ ...newContact, source: "manual" }],
          source: "manual",
        }),
      })

      if (response.ok) {
        toast.success("Contact added successfully!")
        setNewContact({ name: "", phone: "", email: "" })
        setIsAddContactModalOpen(false)
        await loadContacts()
      } else {
        toast.error("Failed to add contact")
      }
    } catch (error) {
      console.error("Error adding contact:", error)
      toast.error("Failed to add contact")
    }
  }

  const handleSendInvites = async () => {
    if (selectedContacts.length === 0) {
      toast.error("Please select contacts to invite")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/send-invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: selectedContacts,
          method: inviteMethod,
          message: customMessage,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)

        // Open invite URLs if available
        if (result.invites) {
          result.invites.forEach((invite: any) => {
            if (invite.url && invite.status === "ready") {
              window.open(invite.url, "_blank")
            }
          })
        }

        setIsInviteModalOpen(false)
        setSelectedContacts([])
        await loadInvitations()
      } else {
        toast.error("Failed to send invites")
      }
    } catch (error) {
      console.error("Error sending invites:", error)
      toast.error("Failed to send invites")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportPhoneContacts = () => {
    // This would require native mobile app capabilities
    toast.info("Phone contacts import requires the mobile app")
  }

  const downloadCSVTemplate = () => {
    const csvContent =
      "Name,Phone,Email\nJohn Doe,+1234567890,john@example.com\nJane Smith,+0987654321,jane@example.com"
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "contacts_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-white">
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
        <TopNav />

        <div className="max-w-md mx-auto p-4 pb-20">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-black mb-2">Contacts</h1>
            <p className="text-gray-600">Import and manage your professional network</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="import">Import</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="invites">Invites</TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Import Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleImportPhoneContacts}
                    className="w-full h-12 bg-black text-white rounded-xl hover:bg-gray-800"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Import from Phone
                  </Button>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isLoading}
                    />
                    <Button
                      variant="outline"
                      className="w-full h-12 border-2 border-dashed rounded-xl bg-transparent"
                      disabled={isLoading}
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      {isLoading ? "Processing..." : "Upload CSV File"}
                    </Button>
                  </div>

                  <Button variant="ghost" onClick={downloadCSVTemplate} className="w-full text-sm text-gray-600">
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV Template
                  </Button>

                  <Button
                    onClick={() => setIsAddContactModalOpen(true)}
                    className="w-full h-12 bg-gray-100 text-black rounded-xl hover:bg-gray-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Contact Manually
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              {registeredContacts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600 flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      Registered ({registeredContacts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {registeredContacts.slice(0, 5).map((contact, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-gray-600">{contact.email}</p>
                          </div>
                          <Button size="sm" className="rounded-full">
                            Chat
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {unregisteredContacts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Not Registered ({unregisteredContacts.length})
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedContacts(unregisteredContacts)
                          setIsInviteModalOpen(true)
                        }}
                        className="rounded-full"
                      >
                        Invite All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {unregisteredContacts.slice(0, 5).map((contact, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-gray-600">{contact.email || contact.phone}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedContacts([contact])
                              setIsInviteModalOpen(true)
                            }}
                            className="rounded-full"
                          >
                            Invite
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="invites" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Sent Invitations ({invitations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invitations.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{invite.contact_name}</p>
                          <p className="text-sm text-gray-600">
                            via {invite.method} • {new Date(invite.sent_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={invite.status === "sent" ? "default" : "secondary"}>{invite.status}</Badge>
                      </div>
                    ))}
                    {invitations.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No invitations sent yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Invite Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Send Invitations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Selected Contacts ({selectedContacts.length})</Label>
              <div className="mt-2 max-h-32 overflow-y-auto">
                {selectedContacts.map((contact, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded mb-1">
                    {contact.name}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Invite Method</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={inviteMethod === "whatsapp" ? "default" : "outline"}
                  onClick={() => setInviteMethod("whatsapp")}
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant={inviteMethod === "sms" ? "default" : "outline"}
                  onClick={() => setInviteMethod("sms")}
                  className="flex-1"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  SMS
                </Button>
                <Button
                  variant={inviteMethod === "email" ? "default" : "outline"}
                  onClick={() => setInviteMethod("email")}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>

            <div>
              <Label>Custom Message (Optional)</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal message to your invitation..."
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvites} disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Invites"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Contact Modal */}
      <Dialog open={isAddContactModalOpen} onOpenChange={setIsAddContactModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Enter contact name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddContactModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact}>Add Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
