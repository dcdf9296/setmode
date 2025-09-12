import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)

    const jobId = searchParams.get("job_id")
    const talentId = searchParams.get("talent_id")
    const status = searchParams.get("status")

    let query = supabase
      .from("job_applications")
      .select(`
        *,
        job:jobs(*),
        talent:users!job_applications_talent_id_fkey(full_name, profile_picture_url, roles, location)
      `)
      .order("applied_at", { ascending: false })

    if (jobId) {
      query = query.eq("job_id", jobId)
    }

    if (talentId) {
      query = query.eq("talent_id", talentId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data: applications, error } = await query

    if (error) {
      console.error("Error fetching applications:", error)
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
    }

    return NextResponse.json({ applications })
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

    const { data: application, error } = await supabase
      .from("job_applications")
      .insert({
        ...body,
        talent_id: session.user.id,
        status: "applied",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating application:", error)
      return NextResponse.json({ error: "Failed to create application" }, { status: 500 })
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { id, status, hirer_notes } = body

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: application, error } = await supabase
      .from("job_applications")
      .update({
        status,
        hirer_notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating application:", error)
      return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
