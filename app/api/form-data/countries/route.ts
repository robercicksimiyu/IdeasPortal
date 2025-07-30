import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get all countries from the countries table
    const { data: countries, error } = await supabase
      .from("countries")
      .select("id, name")
      .order("name", { ascending: true })

      console.log("Fetched countries:", countries);
      console.log("Error:", error);

    if (error) throw error

    return NextResponse.json(countries)
  } catch (error) {
    console.error("Error fetching countries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
