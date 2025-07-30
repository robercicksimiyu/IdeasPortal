import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country")

    if (!country) {
      return NextResponse.json({ error: "Country parameter is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get clusters for the specified country from the clusters table
    const { data: clusters, error } = await supabase
      .from("clusters")
      .select("id, name, country")
      .eq("country", country)
      .order("name", { ascending: true })

    if (error) throw error

    return NextResponse.json(clusters)
  } catch (error) {
    console.error("Error fetching clusters:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
