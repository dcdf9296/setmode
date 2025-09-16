import { NextRequest, NextResponse } from "next/server"

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId
    const { talentId, resumeUrl = null, coverLetter = null } = await req.json()
    if (!jobId || !talentId) {
      return NextResponse.json({ message: "jobId and talentId are required" }, { status: 400 })
    }

    // Ensure job is PUBLISHED and not expired
    const jobResp = await fetch(
      `${SB_URL}/rest/v1/jobs?id=eq.${jobId}&select=status,expires_at`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    )
    if (!jobResp.ok) return NextResponse.json({ message: "Job lookup failed" }, { status: 500 })
    const jobs = await jobResp.json()
    const job = jobs[0]
    if (!job) return NextResponse.json({ message: "Job not found" }, { status: 404 })
    if (job.status !== "PUBLISHED") return NextResponse.json({ message: "Job not open for applications" }, { status: 409 })
    if (job.expires_at && new Date(job.expires_at) < new Date()) {
      return NextResponse.json({ message: "Job expired" }, { status: 410 })
    }

    // Insert application (idempotent)
    const appResp = await fetch(
      `${SB_URL}/rest/v1/job_applications?on_conflict=job_id,talent_id`,
      {
        method: "POST",
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${SB_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation,resolution=ignore-duplicates",
        },
        body: JSON.stringify([
          {
            job_id: jobId,
            talent_id: talentId,
            status: "applied",
            cover_letter: coverLetter,
          },
        ]),
      }
    )

    if (!appResp.ok) {
      const text = await appResp.text()
      console.error("Create application failed:", appResp.status, text)
      return NextResponse.json({ message: "Failed to submit application" }, { status: 500 })
    }

    const apps = await appResp.json()

    // If an invitation exists and is pending, mark it accepted
    await fetch(
      `${SB_URL}/rest/v1/job_invitations?job_id=eq.${jobId}&talent_id=eq.${talentId}&status=eq.pending`,
      {
        method: "PATCH",
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${SB_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ status: "accepted", responded_at: new Date().toISOString() }),
      }
    ).catch(() => {})

    return NextResponse.json({ application: apps[0] ?? null })
  } catch (e) {
    console.error("POST /api/jobs/:jobId/applications error", e)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const { searchParams } = new URL(request.url)

    const jobId = searchParams.get("job_id")
    const jobRoleId = searchParams.get("job_role_id")
    const talentId = searchParams.get("talent_id")
    const status = searchParams.get("status")

    let url =
      `${supabaseUrl}/rest/v1/job_applications` +
      `?select=*,` +
      `job:jobs(*),` +
      `job_role:job_roles(*),` +
      `talent:users!job_applications_talent_id_fkey(full_name,profile_picture_url,roles,location)` +
      `&order=applied_at.desc`

    if (jobId) url += `&job_id=eq.${encodeURIComponent(jobId)}`
    if (jobRoleId) url += `&job_role_id=eq.${encodeURIComponent(jobRoleId)}`
    if (talentId) url += `&talent_id=eq.${encodeURIComponent(talentId)}`
    if (status) url += `&status=eq.${encodeURIComponent(status)}`

    const res = await fetch(url, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("[applications GET] REST error:", res.status, text)
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
    }

    const applications = await res.json()
    return NextResponse.json({ applications })
  } catch (error) {
    console.error("[applications GET] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const body = await request.json()
    const { id, status, hirer_notes } = body

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 })
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/job_applications?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status,
        hirer_notes: hirer_notes ?? null,
        updated_at: new Date().toISOString(),
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      console.error("[applications PATCH] update error:", data)
      return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
    }

    return NextResponse.json({ application: data?.[0] })
  } catch (error) {
    console.error("[applications PATCH] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
