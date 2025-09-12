import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET = "user-files"

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export async function POST(request: NextRequest) {
  console.log("[v0] Upload API called")
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = (formData.get("type") as string) || "profile"

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    const ext =
      (file.type && file.type.split("/")[1]) ||
      (file.name && file.name.split(".").pop()) ||
      "bin"

    const path = `temp/${type}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    console.log("[v0] Uploading to:", path)

    const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    })

    if (uploadError) {
      console.error("[v0] Upload error:", uploadError)
      return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 })
    }

    const { data: publicData } = admin.storage.from(BUCKET).getPublicUrl(path)
    const publicUrl = publicData.publicUrl

    console.log("[v0] Upload successful:", path)
    console.log("[v0] Public URL:", publicUrl)

    return NextResponse.json({ success: true, path, publicUrl })
  } catch (err) {
    console.error("[v0] Upload exception:", err)
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 })
  }
}
