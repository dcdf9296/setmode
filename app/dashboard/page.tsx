"use client"

import { ArrowLeft, Users, Gift, Trophy, Star, Phone, Mail, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function DashboardPage() {
  const router = useRouter()
  const [invitesSent, setInvitesSent] = useState(0)
  const [referralPoints, setReferralPoints] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const response = await fetch("/api/referrals")
        if (response.ok) {
          const data = await response.json()
          setInvitesSent(data.userStats.referralCount)
          setReferralPoints(data.userStats.referralPoints)
          setLeaderboard(data.leaderboard)
        }
      } catch (error) {
        console.error("Failed to fetch referral data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReferralData()
  }, [])

  const rewards = [
    { invites: 5, months: 1, icon: Gift, color: "bg-blue-100 text-blue-600", earned: false },
    { invites: 10, months: 2, icon: Trophy, color: "bg-purple-100 text-purple-600", earned: false },
    { invites: 25, months: 3, icon: Star, color: "bg-yellow-100 text-yellow-600", earned: false },
  ]

  const nextReward = rewards.find((reward) => invitesSent < reward.invites)
  const progress = nextReward ? (invitesSent / nextReward.invites) * 100 : 100
  const remaining = nextReward ? nextReward.invites - invitesSent : 0

  const handleInviteNow = () => {
    setShowInviteModal(true)
  }

  const handleInviteMethod = (method: string) => {
    setShowInviteModal(false)
    // Navigate to contacts import with method parameter
    router.push(`/register?step=7&method=${method}`)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="h-[74px] px-4 flex items-center justify-between bg-white border-b border-gray-200">
          <button onClick={() => router.back()} className="p-2 rounded-full" aria-label="Back">
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          <h1 className="text-lg font-semibold text-black">Dashboard</h1>
          <div className="w-9" />
        </header>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="h-[74px] px-4 flex items-center justify-between bg-white border-b border-gray-200">
        <button onClick={() => router.back()} className="p-2 rounded-full" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <h1 className="text-lg font-semibold text-black">Dashboard</h1>
        <div className="w-9" />
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-2">Invite & Earn Free Months</h2>
          <p className="text-gray-600">Refer friends and get rewarded with free premium access</p>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-black">Your Progress</span>
            </div>
            <span className="text-2xl font-bold text-black">{invitesSent}</span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{invitesSent} invites sent</span>
              <span>{nextReward ? `${remaining} to go` : "All rewards unlocked!"}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {nextReward && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-black">{remaining} more invites</span> to earn your next reward
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Referral Points</span>
              <span className="font-semibold text-black">{referralPoints}</span>
            </div>
          </div>
        </div>

        {/* Reward Cards */}
        <div className="space-y-3">
          <h3 className="font-semibold text-black">Rewards</h3>
          {rewards.map((reward, index) => {
            const Icon = reward.icon
            const isEarned = invitesSent >= reward.invites

            return (
              <div
                key={index}
                className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${
                  isEarned ? "border-green-200 bg-green-50" : "border-gray-100"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${reward.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-black">
                      {reward.months} Free Month{reward.months > 1 ? "s" : ""}
                    </h4>
                    <p className="text-sm text-gray-600">{reward.invites} successful invites</p>
                  </div>
                  {isEarned && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-black mb-4 flex items-center">
            <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
            Top Inviters
          </h3>
          <div className="space-y-3">
            {leaderboard.length > 0 ? (
              leaderboard.map((user: any, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                    {index + 1}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user.full_name?.charAt(0) || "?"}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-black">{user.full_name || "Anonymous"}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{user.referral_count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No referrals yet. Be the first!</p>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleInviteNow}
          className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
        >
          Invite Now
        </button>
      </div>

      {/* Invite Method Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-black mb-2">Choose Invite Method</h3>
              <p className="text-gray-600 text-sm">How would you like to invite your contacts?</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleInviteMethod("phone")}
                className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-colors"
              >
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-black">Phone Contacts</span>
              </button>

              <button
                onClick={() => handleInviteMethod("whatsapp")}
                className="w-full flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-2xl transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-black">WhatsApp</span>
              </button>

              <button
                onClick={() => handleInviteMethod("email")}
                className="w-full flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-colors"
              >
                <Mail className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-black">Email</span>
              </button>
            </div>

            <button onClick={() => setShowInviteModal(false)} className="w-full py-3 text-gray-600 font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
