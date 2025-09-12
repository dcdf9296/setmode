import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function getUserByEmail(email: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?email=eq.${email}&select=*`, {
      method: "GET",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    })
    const data = await response.json()
    return data.length > 0 ? data[0] : null
  } catch (error) {
    console.error("Database query error:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log("[v0] Login attempt for email:", email)

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData?.user) {
      console.log("[v0] Supabase auth failed:", authError?.message)
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Get user data from our database using the auth user ID
    const userData = await getUserByEmail(email)

    if (!userData) {
      console.log("[v0] User data not found in database:", email)
      return NextResponse.json({ success: false, error: "User profile not found" }, { status: 404 })
    }

    console.log("[v0] Login successful for:", email)

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = userData

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 })
  }
}
