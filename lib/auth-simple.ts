interface AuthUser {
  id: string
  email: string
  full_name: string
}

interface AuthResponse {
  success: boolean
  user?: AuthUser
  error?: string
}

export class SimpleAuth {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    this.apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  }

  async getSession(): Promise<{ data: { session: AuthUser | null } }> {
    if (typeof window === "undefined") {
      return { data: { session: null } }
    }

    const session = localStorage.getItem("auth_session")
    return { data: { session: session ? JSON.parse(session) : null } }
  }

  async signInWithPassword({ email, password }: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_session", JSON.stringify(data.user))
        }
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error || "Login failed" }
      }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  async signOut(): Promise<{ error?: string }> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_session")
    }
    return {}
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data } = await this.getSession()
    return data.session
  }
}

export const auth = new SimpleAuth()

// Updated to work properly in both sync and async contexts
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  return await auth.getCurrentUser()
}

// Added synchronous version for compatibility
export const getCurrentUserSync = (): AuthUser | null => {
  if (typeof window === "undefined") {
    return null
  }

  const session = localStorage.getItem("auth_session")
  return session ? JSON.parse(session) : null
}

// Legacy compatibility exports
export function createClient() {
  return {
    auth: auth,
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
  }
}
