"use client"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Send, Plus, X, Briefcase, Phone, Video, FileText, ImageIcon, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter, useParams } from "next/navigation"
// import ModeSwitcher from "@/components/mode-switcher" // Removed ModeSwitcher component
import {
  getCurrentMode,
  getTalentById,
  getJobById,
  getHirerById,
  type Talent,
  type Job,
  type Hirer,
} from "@/lib/data-store"

interface Message {
  id: string
  text: string
  sender: "user" | "other"
  timestamp: string
  isTyping?: boolean
}

/* Mock conversation so the screen has content */
const mockMessages: Message[] = [
  {
    id: "1",
    text: "Hi! I'm interested in your hair styling project for Milan Fashion Week.",
    sender: "other",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    text: "That sounds perfect! Can you tell me more about your experience with editorial work?",
    sender: "user",
    timestamp: "10:32 AM",
  },
]

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const chatId = params.id as string

  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showFileOptions, setShowFileOptions] = useState(false)

  const [mode, setMode] = useState<"hirer" | "talent">("hirer")
  const [talentInfo, setTalentInfo] = useState<Talent | null>(null)
  const [hirerInfo, setHirerInfo] = useState<Hirer | null>(null)
  const [jobInfo, setJobInfo] = useState<Job | null>(null)

  const [isGroupChat, setIsGroupChat] = useState(false)
  const [chatTitle, setChatTitle] = useState("Chat")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentMode = getCurrentMode()
    setMode(currentMode)

    const isJobChat = chatId.startsWith("job-")

    if (isJobChat) {
      const jobId = chatId.replace("job-", "")
      const job = getJobById(jobId)
      setJobInfo(job || null)
      setIsGroupChat(true)
      setChatTitle(job?.title || "Job Room")
    } else {
      setIsGroupChat(false)
      if (currentMode === "hirer") {
        const talent = getTalentById(chatId)
        setTalentInfo(talent || null)
        if (talent) {
          setChatTitle(talent.name)
        }
      } else {
        const hirer = getHirerById(chatId)
        setHirerInfo(hirer || null)
        if (hirer) setChatTitle(hirer.name)
      }
    }

    const handleStorageChange = () => {
      const newMode = getCurrentMode()
      if (newMode !== mode) {
        router.push("/")
      } else {
        window.location.reload()
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [chatId, mode, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, userMsg])
    setNewMessage("")
    setIsTyping(false)
  }

  const handleHeaderClick = () => {
    if (mode === "hirer" && talentInfo) router.push(`/talent/${talentInfo.slug}`)
    else if (jobInfo) router.push(`/job/${jobInfo.id}`)
  }

  const otherPartyAvatar = mode === "hirer" ? talentInfo?.avatar : hirerInfo?.avatar
  const otherPartyName = mode === "hirer" ? talentInfo?.name : hirerInfo?.name

  const handleFileUpload = (type: string) => {
    // Handle file upload based on type
    console.log(`Uploading ${type}`)
    setShowFileOptions(false)
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col relative">
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

      <div className="max-w-md mx-auto flex flex-col h-screen w-full relative z-10">
        <header className="px-4 py-3 flex items-center justify-between h-16 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button onClick={() => router.back()} variant="ghost" className="p-0">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
            {talentInfo && (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={talentInfo.avatar || "/placeholder.svg"} alt={talentInfo.name} />
                  <AvatarFallback>{talentInfo.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-black font-semibold text-sm">{talentInfo.name}</h1>
                  <p className="text-xs text-gray-600">
                    {talentInfo.role} • {talentInfo.location}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            <Video className="w-5 h-5 text-black" />
            <Phone className="w-5 h-5 text-black" />
          </div>
        </header>

        <main className="flex-1 px-4 pb-0 pt-2 flex flex-col">
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-start gap-2 max-w-[80%]">
                    {msg.sender === "other" && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={otherPartyAvatar || "/placeholder.svg"} alt={otherPartyName} />
                        <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                          {otherPartyName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        msg.sender === "user" ? "bg-gray-200 text-black" : "bg-white text-gray-900 shadow-sm"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-gray-600" : "text-gray-500"}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 bg-transparent z-20">
          <div className="max-w-md mx-auto px-4 py-4">
            {mode === "hirer" && !isGroupChat && (
              <div className="mb-3 flex gap-2 justify-end">
                <Button
                  onClick={() => router.push(`/invite-to-job?talentId=${talentInfo?.id}`)}
                  className="bg-white hover:bg-gray-50 text-black border-0 rounded-full px-6 h-12 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm">Invite to Job</span>
                  </div>
                </Button>
                <Button
                  onClick={() => setShowFileOptions(!showFileOptions)}
                  className="bg-white hover:bg-gray-50 text-black border-0 rounded-full w-12 h-12 p-0 shadow-lg"
                >
                  {showFileOptions ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </Button>
              </div>
            )}

            {showFileOptions && (
              <div className="mb-3 bg-transparent rounded-2xl p-3">
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => handleFileUpload("document")}
                    className="flex flex-col items-center gap-2 h-16 rounded-xl bg-white text-black border-0 shadow-lg hover:shadow-xl"
                  >
                    <FileText className="w-5 h-5 text-black" />
                    <span className="text-xs text-black">Document</span>
                  </Button>
                  <Button
                    onClick={() => handleFileUpload("photo")}
                    className="flex flex-col items-center gap-2 h-16 rounded-xl bg-white text-black border-0 shadow-lg hover:shadow-xl"
                  >
                    <ImageIcon className="w-5 h-5 text-black" />
                    <span className="text-xs text-black">Photo</span>
                  </Button>
                  <Button
                    onClick={() => handleFileUpload("camera")}
                    className="flex flex-col items-center gap-2 h-16 rounded-xl bg-white text-black border-0 shadow-lg hover:shadow-xl"
                  >
                    <Camera className="w-5 h-5 text-black" />
                    <span className="text-xs text-black">Camera</span>
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="w-full pl-4 pr-4 py-3 bg-white border-0 rounded-full text-black placeholder-gray-500 focus:ring-0 focus:border-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-lg"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-black hover:bg-gray-800 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
