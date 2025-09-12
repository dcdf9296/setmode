interface DatabaseClient {
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: any): Promise<{ data: any; error: any }>
    }
    insert(data: any): Promise<{ data: any; error: any }>
    update(data: any): {
      eq(column: string, value: any): Promise<{ data: any; error: any }>
    }
  }
}

export const createServerSupabaseClient = (): DatabaseClient => {
  return {
    from(table: string) {
      return {
        select(columns: string) {
          return {
            async eq(column: string, value: any) {
              try {
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}&select=${columns}`,
                  {
                    method: "GET",
                    headers: {
                      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
                      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
                    },
                  },
                )
                const data = await response.json()
                return { data: data.length > 0 ? data[0] : null, error: null }
              } catch (error) {
                return { data: null, error }
              }
            },
          }
        },
        async insert(data: any) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
                Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
                Prefer: "return=representation",
              },
              body: JSON.stringify(data),
            })
            const result = await response.json()
            return { data: result, error: null }
          } catch (error) {
            return { data: null, error }
          }
        },
        update(data: any) {
          return {
            async eq(column: string, value: any) {
              try {
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
                      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
                      Prefer: "return=representation",
                    },
                    body: JSON.stringify(data),
                  },
                )
                const result = await response.json()
                return { data: result, error: null }
              } catch (error) {
                return { data: null, error }
              }
            },
          }
        },
      }
    },
  }
}

export const createClient = createServerSupabaseClient
export const createServerClient = createServerSupabaseClient
