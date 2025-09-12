import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's referral stats
    const { data: userStats, error: statsError } = await supabase
      .from("users")
      .select("referral_count, referral_points")
      .eq("id", user.id)
      .single()

    if (statsError) {
      return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 })
    }

    // Get leaderboard (top 10 users by referral count)
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from("users")
      .select("full_name, referral_count")
      .order("referral_count", { ascending: false })
      .limit(10)

    if (leaderboardError) {
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
    }

    // Calculate progress to next milestone
    const milestones = [5, 10, 25, 50, 100]
    const currentCount = userStats.referral_count || 0
    const nextMilestone = milestones.find((m) => m > currentCount) || 100
    const progress = (currentCount / nextMilestone) * 100

    return NextResponse.json({
      userStats: {
        referralCount: currentCount,
        referralPoints: userStats.referral_points || 0,
        progress,
        nextMilestone,
      },
      leaderboard,
    })
  } catch (error) {
    console.error("Referrals API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { referredEmails } = await request.json()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Process referrals and update user stats
    const { error: updateError } = await supabase.rpc("process_referrals", {
      user_id: user.id,
      referred_emails: referredEmails,
    })

    if (updateError) {
      return NextResponse.json({ error: "Failed to process referrals" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Referrals POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
