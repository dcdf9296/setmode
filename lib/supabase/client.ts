interface SupabaseClient {
  auth: {
    getSession(): Promise<{ data: { session: any } }>
    signInWithPassword(credentials: { email: string; password: string }): Promise<{ data: any; error: any }>
    signUp(credentials: { email: string; password: string; options?: any }): Promise<{ data: any; error: any }>
    signOut(): Promise<{ error: any }>
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient(): SupabaseClient {
  return {
    auth: {
      async getSession() {
        const session = localStorage.getItem("supabase_session")
        return { data: { session: session ? JSON.parse(session) : null } }
      },

      async signInWithPassword({ email, password }) {
        try {
          const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseAnonKey,
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (response.ok) {
            localStorage.setItem("supabase_session", JSON.stringify(data))
            return { data, error: null }
          } else {
            return { data: null, error: data }
          }
        } catch (_error) {
          return { data: null, error: { message: "Network error" } }
        }
      },

      async signUp({ email, password, options }) {
        try {
          const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseAnonKey,
            },
            body: JSON.stringify({
              email,
              password,
              data: options?.data || {},
            }),
          })

          const data = await response.json()

          if (response.ok) {
            localStorage.setItem("supabase_session", JSON.stringify(data))
            return { data, error: null }
          } else {
            return { data: null, error: data }
          }
        } catch (_error) {
          return { data: null, error: { message: "Network error" } }
        }
      },

      async signOut() {
        localStorage.removeItem("supabase_session")
        return { error: null }
      },
    },
  }
}

export const supabase = createClient()
