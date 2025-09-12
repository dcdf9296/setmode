import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.error("[users api] Missing Supabase env vars")
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") || ""
    const location = searchParams.get("location") || ""
    const from = searchParams.get("from") // YYYY-MM-DD
    const to = searchParams.get("to") // YYYY-MM-DD

    let url = `${supabaseUrl}/rest/v1/users?select=*`

    const filters: string[] = []

    if (role) {
      // roles is TEXT[]; PostgREST "cs" operator checks array contains
      // Example: roles=cs.{"Hair Stylist"}
      const roleArrayJson = JSON.stringify([role])
      filters.push(`roles=cs.${encodeURIComponent(roleArrayJson)}`)
    }

    if (location) {
      // partial, case-insensitive match
      filters.push(`location=ilike.${encodeURIComponent(`%${location}%`)}`)
    }

    if (from && to) {
      // Overlap: start <= to AND end >= from
      filters.push(`availability_start_date=lte.${to}`)
      filters.push(`availability_end_date=gte.${from}`)
    }

    // Order newest first
    filters.push(`order=created_at.desc`)

    if (filters.length > 0) {
      url += `&${filters.join("&")}`
    }

    const res = await fetch(url, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("[users api] REST error:", res.status, text)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    const users = await res.json()
    return NextResponse.json({ users })
  } catch (e) {
    console.error("[users api] exception:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
