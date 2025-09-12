"use client"

import { ArrowLeft, Bell } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NotificationsPage() {
  const router = useRouter()
  const notifications = [
    { id: "1", title: "New message", body: "You have a new message from Vittoria.", time: "2m ago" },
    { id: "2", title: "Invite Accepted", body: "Lucia accepted your job invitation.", time: "1h ago" },
    { id: "3", title: "Reminder", body: "Don't forget to review applications.", time: "1d ago" },
  ]
  return (
    <main className="min-h-screen bg-white">
      <header className="h-[74px] px-4 flex items-center justify-between bg-white border-b border-gray-200">
        {/* Removed floating effect from back button */}
        <button onClick={() => router.back()} className="p-2 rounded-full" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <h1 className="text-lg font-semibold text-black">Notifications</h1>
        <div className="w-9" />
      </header>
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          {notifications.map((n, idx) => (
            <div
              key={n.id}
              className={`px-4 py-4 bg-white ${idx < notifications.length - 1 ? "border-b border-gray-200" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-black" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-black">{n.title}</p>
                  <p className="text-sm text-gray-600">{n.body}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
