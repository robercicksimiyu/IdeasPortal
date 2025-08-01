import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

       

    const supabase = createServerClient()

    // Build query for API promoters from users table
    let query = supabase
      .from("kaizen_promoters")
      .select("id, name")

    // Filter by department if provided
    

    const { data: apiPromoters, error } = await query.order("name", { ascending: true })

    if (error) throw error

    return NextResponse.json(apiPromoters || [])
  } catch (error) {
    console.error("Error fetching API promoters:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
