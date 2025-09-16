import { NextRequest, NextResponse } from "next/server"

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

function uuid() {
  const g = (globalThis as any)?.crypto
  return g?.randomUUID ? g.randomUUID() : "tok-" + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId
    const { talentIds = [], role = null, expiresAt = null, message = null } = await req.json()

    if (!jobId || !Array.isArray(talentIds) || talentIds.length === 0) {
      return NextResponse.json({ message: "jobId and talentIds are required" }, { status: 400 })
    }

    const rows = talentIds.map((talentId: string) => ({
      job_id: jobId,
      talent_id: talentId,
      role,
      status: "pending",
      token: uuid(),
      expires_at: expiresAt,
      message,
      created_at: new Date().toISOString(),
    }))

    // Note on_conflict uses (job_id,talent_id)
    const resp = await fetch(`${SB_URL}/rest/v1/job_invitations?on_conflict=job_id,talent_id`, {
      method: "POST",
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation,resolution=ignore-duplicates",
      },
      body: JSON.stringify(rows),
    })

    if (!resp.ok) {
      const text = await resp.text()
      console.error("Invite candidates failed:", resp.status, text)
      return NextResponse.json({ message: "Failed to create invitations" }, { status: 500 })
    }

    const created = await resp.json()
    // TODO enqueue notification/email for created only
    return NextResponse.json({ createdCount: created.length, invitations: created })
  } catch (e) {
    console.error("POST /api/jobs/:jobId/invitations error", e)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
