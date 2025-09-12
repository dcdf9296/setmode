"use client"

import { useState } from "react"
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Shield,
  Bell,
  Menu,
  Grid3X3,
  MessageCircle,
  Briefcase,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import ModeSwitcher from "@/components/mode-switcher"

export default function LockFundsPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState<"card" | "bank" | null>(null)

  const handleBack = () => {
    router.back()
  }

  const handleLockFunds = () => {
    if (!amount || !selectedMethod) {
      alert("Please enter an amount and select a payment method")
      return
    }

    // Handle fund locking logic
    console.log("Locking funds:", { amount, method: selectedMethod })

    // Navigate back or to confirmation page
    router.back()
  }

  return (
    <div className="min-h-screen bg-white antialiased font-sans">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-white px-4 py-3 flex items-center justify-between h-16 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Button onClick={handleBack} variant="ghost" className="p-0">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
            <h1 className="text-lg font-bold text-black ml-2">Lock Funds</h1>
          </div>
          <div className="flex items-center gap-3">
            <ModeSwitcher />
            <Bell className="w-5 h-5 text-black" />
            <Menu className="w-5 h-5 text-black" />
          </div>
        </header>

        {/* Content */}
        <div className="pt-20 px-4 pb-24">
          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Secure Payment</h3>
                <p className="text-sm text-blue-700">
                  Your funds will be held securely until the job is completed. This protects both you and the talent.
                </p>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <Card className="mb-6 bg-white">
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Lock Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">€</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8 py-3 text-lg bg-white text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">Enter the total amount you want to lock for this job</p>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="mb-6 bg-white">
            <CardHeader>
              <CardTitle className="text-black">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                onClick={() => setSelectedMethod("card")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedMethod === "card" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-black">Credit/Debit Card</h4>
                    <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setSelectedMethod("bank")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedMethod === "bank" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-600 rounded"></div>
                  <div>
                    <h4 className="font-medium text-black">Bank Transfer</h4>
                    <p className="text-sm text-gray-600">Direct bank transfer (SEPA)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          <div className="text-xs text-gray-600 mb-6">
            <p>
              By locking funds, you agree to our{" "}
              <span className="text-blue-600 underline cursor-pointer">Terms of Service</span> and{" "}
              <span className="text-blue-600 underline cursor-pointer">Payment Policy</span>. Funds will be released
              upon job completion or dispute resolution.
            </p>
          </div>

          {/* Lock Funds Button */}
          <Button
            onClick={handleLockFunds}
            disabled={!amount || !selectedMethod}
            className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white py-4 rounded-2xl font-semibold text-lg"
          >
            Lock €{amount || "0.00"}
          </Button>
        </div>

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
