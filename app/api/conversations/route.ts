import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        *,
        job:jobs(title, role),
        hirer:users!conversations_hirer_id_fkey(full_name, profile_picture_url),
        talent:users!conversations_talent_id_fkey(full_name, profile_picture_url, roles, location)
      `)
      .or(`hirer_id.eq.${session.user.id},talent_id.eq.${session.user.id}`)
      .eq("status", "active")
      .order("last_message_at", { ascending: false })

    if (error) {
      console.error("Error fetching conversations:", error)
      return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
    }

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { job_id, talent_id, hirer_id } = body

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("job_id", job_id)
      .eq("talent_id", talent_id)
      .eq("hirer_id", hirer_id)
      .single()

    if (existing) {
      return NextResponse.json({ conversation: existing })
    }

    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert({
        job_id,
        talent_id,
        hirer_id,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating conversation:", error)
      return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
