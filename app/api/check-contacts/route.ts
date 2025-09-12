import { type NextRequest, NextResponse } from "next/server"

interface Contact {
  name: string
  phone?: string
  email?: string
  isRegistered?: boolean
}

async function checkUserExists(email: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?email=eq.${email}&select=email,full_name`,
    {
      method: "GET",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    },
  )
  const data = await response.json()
  return data.length > 0 ? data[0] : null
}

export async function POST(request: NextRequest) {
  try {
    const { contacts } = await request.json()

    const registered: Contact[] = []
    const unregistered: Contact[] = []

    // Check each contact against the database
    for (const contact of contacts) {
      if (contact.email) {
        const existingUser = await checkUserExists(contact.email)

        if (existingUser) {
          registered.push({ ...contact, isRegistered: true })
        } else {
          unregistered.push({ ...contact, isRegistered: false })
        }
      } else {
        // If no email, assume unregistered
        unregistered.push({ ...contact, isRegistered: false })
      }
    }

    return NextResponse.json({ registered, unregistered })
  } catch (error) {
    console.error("Check contacts error:", error)
    return NextResponse.json({ success: false, message: "Failed to check contacts" }, { status: 500 })
  }
}
