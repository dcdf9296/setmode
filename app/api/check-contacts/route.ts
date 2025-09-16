import { type NextRequest, NextResponse } from "next/server"

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface Contact {
  name: string
  phone?: string
  email?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const contacts: Contact[] = Array.isArray(body.contacts) ? body.contacts : []

    if (!contacts.length) {
      return NextResponse.json({ registered: [], unregistered: [] })
    }

    const registered: Contact[] = []
    const unregistered: Contact[] = []

    // For simplicity and safety (no tricky IN quoting), query per contact
    for (const c of contacts) {
      let found = null

      if (c.email) {
        const res = await fetch(
          `${SB_URL}/rest/v1/users?select=id,email,full_name,phone&email=eq.${encodeURIComponent(c.email)}&limit=1`,
          {
            headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
            cache: "no-store",
          },
        )
        if (res.ok) {
          const rows = await res.json()
          found = rows?.[0] || null
        }
      }

      if (!found && c.phone) {
        const res = await fetch(
          `${SB_URL}/rest/v1/users?select=id,email,full_name,phone&phone=eq.${encodeURIComponent(c.phone)}&limit=1`,
          {
            headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
            cache: "no-store",
          },
        )
        if (res.ok) {
          const rows = await res.json()
          found = rows?.[0] || null
        }
      }

      if (found) {
        registered.push({ ...c, isRegistered: true })
      } else {
        unregistered.push({ ...c, isRegistered: false })
      }
    }

    return NextResponse.json({ registered, unregistered })
  } catch (error) {
    console.error("check-contacts error:", error)
    return NextResponse.json({ registered: [], unregistered: [] }, { status: 200 })
  }
}
