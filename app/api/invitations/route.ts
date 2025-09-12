import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobId, talentIds, message } = await request.json()

    // Create invitations for each talent
    const invitations = talentIds.map((talentId: string) => ({
      job_id: jobId,
      talent_id: talentId,
      status: "invited",
      hirer_notes: message,
      applied_at: new Date().toISOString(),
    }))

    const { data, error } = await supabase.from("job_applications").insert(invitations).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notifications for invited talents
    const notifications = talentIds.map((talentId: string) => ({
      user_id: talentId,
      title: "Job Invitation",
      message: `You've been invited to apply for a job`,
      notification_type: "job_application",
      related_id: jobId,
    }))

    await supabase.from("notifications").insert(notifications)

    return NextResponse.json({ success: true, invitations: data })
  } catch (error) {
    console.error("Invitation error:", error)
    return NextResponse.json({ error: "Failed to send invitations" }, { status: 500 })
  }
}
