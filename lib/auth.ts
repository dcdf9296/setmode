interface User {
  id: string
  email: string
  [key: string]: any
}

interface AuthResponse {
  user?: User
  error?: string
}

export class AuthClient {
  private supabaseUrl: string
  private supabaseKey: string

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  }

  async getSession(): Promise<{ data: { session: any } }> {
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

      if (response.ok) {
        localStorage.setItem("auth_session", JSON.stringify(data.user))
        return { user: data.user }
      } else {
        return { error: data.error || "Login failed" }
      }
    } catch (error) {
      return { error: "Network error" }
    }
  }

  async signUp({
    email,
    password,
    options,
  }: { email: string; password: string; options?: any }): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ...options }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("auth_session", JSON.stringify(data.user))
        return { user: data.user }
      } else {
        return { error: data.error || "Registration failed" }
      }
    } catch (error) {
      return { error: "Network error" }
    }
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem("auth_session")
    return {}
  }
}

export function createClient() {
  return {
    auth: new AuthClient(),
  }
}
