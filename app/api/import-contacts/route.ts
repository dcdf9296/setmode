import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

interface Contact {
  name: string
  phone?: string
  email?: string
  source: "csv" | "phone" | "manual"
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { contacts, source } = await request.json()

    // Store contacts in the database
    const contactsToInsert = contacts.map((contact: Contact) => ({
      user_id: user.id,
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      source: source || "manual",
      created_at: new Date().toISOString(),
    }))

    const { data: insertedContacts, error } = await supabase.from("contacts").insert(contactsToInsert).select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save contacts" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Contacts imported successfully",
      contactCount: insertedContacts.length,
      contacts: insertedContacts,
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
