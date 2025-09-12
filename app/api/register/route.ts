import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log("[v0] Registration data received:", { email: data?.email, fullName: data?.fullName })

    const {
      email,
      password,
      fullName,
      roles = [],
      location = "",
      employmentStatus,
      companyName,
      bio,
      skills = [],
      phone,
      profilePictureUrl, // MUST be the Storage public URL from /api/upload
      portfolioUrls = [],
      cvUrl,
      contacts = [],
    } = data || {}

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: "Missing email, password or fullName" },
        { status: 400 },
      )
    }

    // Create auth user
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    console.log("[v0] Auth user creation result:", { user: authUser?.user?.id, error: authError })

    if (authError || !authUser?.user) {
      const message =
        authError?.message || "Failed to create authentication account"
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }

    const userId = authUser.user.id
    console.log("[v0] Using auth user ID:", userId)

    // Upsert public.users (remove non-existent columns like password_hash)
    const { error: upsertErr } = await admin
      .from("users")
      .upsert(
        {
          id: userId,
          email,
          full_name: fullName,
          roles,
          location,
          employment_status: employmentStatus || null,
          company_name: companyName || null,
          bio: bio || null,
          skills,
          phone: phone || null,
          profile_picture_url: profilePictureUrl || null,
          portfolio_urls: portfolioUrls,
          cv_url: cvUrl || null,
        },
        { onConflict: "id" }
      )

    if (upsertErr) {
      console.error("[v0] insertUser error:", upsertErr)
      // rollback auth user to keep things consistent
      await admin.auth.admin.deleteUser(userId).catch(() => {})
      return NextResponse.json(
        { success: false, error: upsertErr.message || "Database error" },
        { status: 500 }
      )
    }

    // Optional: insert contacts if provided
    if (Array.isArray(contacts) && contacts.length > 0) {
      const contactsData = contacts.map((c: any) => ({
        user_id: userId,
        email: c.email,
        full_name: c.name,
        phone: c.phone,
        is_registered: Boolean(c.isRegistered),
        created_at: new Date().toISOString(),
      }))

      const { error: contactsErr } = await admin.from("contacts").insert(contactsData)
      if (contactsErr) {
        console.warn("[v0] contacts insert warning:", contactsErr)
        // Non-fatal: continue
      }
    }

    console.log("[v0] User created/updated successfully:", userId)
    return NextResponse.json({
      success: true,
      user: { id: userId, email, full_name: fullName },
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ success: false, error: "Registration failed" }, { status: 500 })
  }
}
