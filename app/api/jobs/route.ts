import { NextRequest, NextResponse } from "next/server"

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const hirerIdParam = searchParams.get("hirerId") || ""
    const role = searchParams.get("role") || ""
    const location = searchParams.get("location") || ""

    const select = "*,hirer:users!jobs_hirer_id_fkey(full_name,profile_picture_url)"
    let url = `${SB_URL}/rest/v1/jobs?select=${encodeURIComponent(select)}&order=created_at.desc`

    if (id) {
      url += `&id=eq.${encodeURIComponent(id)}`
    } else {
      const ids = hirerIdParam.split(",").map((s) => s.trim()).filter(Boolean)
      if (ids.length === 0) {
        return NextResponse.json({ message: "hirerId required when id is not provided" }, { status: 400 })
      }
      url += ids.length === 1
        ? `&hirer_id=eq.${encodeURIComponent(ids[0])}`
        : `&hirer_id=in.(${ids.join(",")})`
    }

    if (role) url += `&role=eq.${encodeURIComponent(role)}`
    if (location) {
      const loc = encodeURIComponent(`%${location}%`)
      url += `&location=ilike.${loc}`
    }

    const res = await fetch(url, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
      cache: "no-store",
    })

    if (!res.ok) {
      const txt = await res.text()
      return NextResponse.json({ message: "Failed to load jobs", error: txt }, { status: 500 })
    }

    const rows = await res.json()

    // Normalize common UI fields so the page mapping works
    const normalize = (j: any) => ({
      ...j,
      budget: j.budget ?? null,
      start_date: j.start_date ?? j.date ?? null,
      end_date: j.end_date ?? (j.deadline ? new Date(j.deadline).toISOString().slice(0, 10) : null),
      roles_needed:
        Array.isArray(j.roles_needed) && j.roles_needed.length > 0 ? j.roles_needed : j.role ? [j.role] : [],
    })

    if (id) {
      const row = rows?.[0] || null
      return NextResponse.json({ job: row ? normalize(row) : null })
    }

    const jobs = (rows || []).map(normalize)
    return NextResponse.json({ jobs })
  } catch (e) {
    console.error("GET /api/jobs error", e)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const hirer_id = body.hirerId || body.createdBy || req.headers.get("x-user-id")
    if (!hirer_id) {
      return NextResponse.json({ message: "hirerId is required" }, { status: 400 })
    }
    if (!body?.title) {
      return NextResponse.json({ message: "title is required" }, { status: 400 })
    }

    // Map UI fields -> DB (UI-first)
    const role =
      body.role ??
      (Array.isArray(body.rolesNeeded) && body.rolesNeeded[0]) ??
      (Array.isArray(body.roleEntries) && body.roleEntries[0]?.role) ??
      "unspecified"
    const location = body.location || "unspecified"

    const startDate =
      body.startDate ??
      (Array.isArray(body.roleEntries) ? body.roleEntries[0]?.startDate : null) ??
      body.date ??
      null
    const endDate =
      body.endDate ??
      (Array.isArray(body.roleEntries) ? body.roleEntries[0]?.endDate : null) ??
      body.deadline ??
      null

    const budget = body.budget ?? (Array.isArray(body.roleEntries) ? body.roleEntries[0]?.budget : null)

    const roles_needed = Array.isArray(body.rolesNeeded)
      ? body.rolesNeeded
      : Array.isArray(body.roleEntries)
        ? body.roleEntries.map((r: any) => r?.role).filter(Boolean)
        : role
          ? [role]
          : []

    // Only send columns that exist in your current schema (no budget_min/budget_max)
    const payload: Record<string, any> = {
      title: body.title,
      description: body.description ?? null,
      location,
      status: normalizeStatus(body.status || "active"),
      hirer_id,
      // UI-friendly columns
      start_date: startDate ?? null,
      end_date: endDate ?? null,
      budget: budget ?? null,
      roles_needed: roles_needed.length ? roles_needed : null,
      // If your table still has "role" column and it's required, keep it.
      // If you removed it, you can comment the next line out:
      role,
    }

    // Remove undefined keys
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k])

    const resp = await fetch(`${SB_URL}/rest/v1/jobs`, {
      method: "POST",
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    })

    const text = await resp.text()
    if (!resp.ok) {
      return NextResponse.json(
        { message: "Failed to create job", supabase: text || "no body", status: resp.status },
        { status: 400 },
      )
    }

    const [job] = text ? JSON.parse(text) : []
    return NextResponse.json({ job })
  } catch (e) {
    console.error("POST /api/jobs error", e)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
