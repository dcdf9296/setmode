export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    if (!token) return NextResponse.json({ message: "token required" }, { status: 400 })

    // Fetch invitation by token
    const getResp = await fetch(`${SB_URL}/rest/v1/job_invitations?token=eq.${encodeURIComponent(token)}&select=*`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    })
    if (!getResp.ok) {
     return NextResponse.json({ message: "Invitation lookup failed" }, { status: 500 })
    }
    const invites = await getResp.json()
    const invite = invites[0]
    if (!invite) return NextResponse.json({ message: "Invalid token" }, { status: 404 })

    if (invite.status !== "PENDING") {
      // Idempotent: return existing application if any
      const appResp = await fetch(
        `${SB_URL}/rest/v1/job_applications?job_id=eq.${invite.job_id}&talent_id=eq.${invite.talent_id}&select=*`,
        { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
      )
      const apps = appResp.ok ? await appResp.json() : []
      return NextResponse.json({ invitation: invite, application: apps[0] ?? null })
    }

    // Optional: expiry check
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ message: "Invitation expired" }, { status: 409 })
    }

    // Update invitation to ACCEPTED only if currently PENDING (prevents races)
    const patchResp = await fetch(
      `${SB_URL}/rest/v1/job_invitations?token=eq.${encodeURIComponent(token)}&status=eq.PENDING`,
      {
        method: "PATCH",
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${SB_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ status: "ACCEPTED", responded_at: new Date() }),

      }
    )

    if (!patchResp.ok) {
      const text = await patchResp.text()
      cool.error("Accept failed:", patchResp.status, text)
      return NextResponse.json({ message: "Failed to accept invitation"}, { status: 409 })
    }

    const [updated] = await patchResp.json()

    // Create application (idempotent via unique constraint)
    const appInsert = await fetch(
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
            job_id: updated.job_id,
            talent_id: updated.talent_id, // NOTE: talent_id, not candidate_id
            status: "applied",            // align with your job_applications status enum
          },
        ]),
      }
    )

    // We accepted the invitation but failed to insert application; return accepted invitation and null application
    if (!appInsert.ok) {
      return NextResponse.json({ invitation: updated, application: null })
    }

    const [app] = await appInsert.json()
    return NextResponse.json({ invitation: updated, application: app })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}