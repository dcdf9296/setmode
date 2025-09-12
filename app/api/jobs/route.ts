import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)

    const role = searchParams.get("role")
    const location = searchParams.get("location")
    const status = searchParams.get("status") || "active"

    let query = supabase
      .from("jobs")
      .select(`
        *,
        hirer:users!jobs_hirer_id_fkey(full_name, profile_picture_url)
      `)
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (role) {
      query = query.eq("role", role)
    }

    if (location) {
      query = query.eq("location", location)
    }

    const { data: jobs, error } = await query

    if (error) {
      console.error("Error fetching jobs:", error)
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
    }

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        ...body,
        hirer_id: session.user.id,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating job:", error)
      return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
