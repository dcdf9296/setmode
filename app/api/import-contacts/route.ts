import { type NextRequest, NextResponse } from "next/server"

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface Contact {
  name: string
  phone?: string
  email?: string
  source?: "csv" | "phone" | "manual"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.userId || request.headers.get("x-user-id")
    const contacts: Contact[] = Array.isArray(body.contacts) ? body.contacts : []
    const source = (body.source as Contact["source"]) || "manual"

    if (!userId) {
      return NextResponse.json({ error: "Missing userId (send in body or x-user-id header)" }, { status: 401 })
    }
    if (!contacts.length) {
      return NextResponse.json({ error: "No contacts provided" }, { status: 400 })
    }

    const contactsToInsert = contacts.map((c) => ({
      user_id: userId,
      name: c.name,
      phone: c.phone || null,
      email: c.email || null,
      source,
      created_at: new Date().toISOString(),
    }))

    const resp = await fetch(`${SB_URL}/rest/v1/contacts`, {
      method: "POST",
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(contactsToInsert),
    })

    const text = await resp.text()
    if (!resp.ok) {
      console.error("Supabase error:", resp.status, text)
      return NextResponse.json({ error: "Failed to save contacts", supabase: text }, { status: 500 })
    }

    const inserted = text ? JSON.parse(text) : []
    return NextResponse.json({
      success: true,
      message: "Contacts imported successfully",
      contactCount: inserted.length,
      contacts: inserted,
    })
  } catch (error) {
    console.error("Import contacts error:", error)
    return NextResponse.json({ error: "Failed to import contacts" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: contacts, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ contacts })
  } catch (error) {
    console.error("Get contacts error:", error)
    return NextResponse.json({ error: "Failed to get contacts" }, { status: 500 })
  }
}
