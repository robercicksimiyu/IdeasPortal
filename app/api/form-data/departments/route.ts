import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

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

    // Get departments for the specified country from the departments table
    const { data: departments, error } = await supabase
      .from("departments")
      .select("id, department_code,department_name, country, cluster")
      .eq("country", country)
      .order("department_code", { ascending: true })

    if (error) throw error

    // Transform to match expected format
    const transformedDepartments =
      departments?.map((dept) => ({
        id: dept.id,
        department_name: dept.department_name, // Using code as name for now
        department_code: dept.department_code,
        country: dept.country,
        cluster: dept.cluster,
      })) || []

    return NextResponse.json(transformedDepartments)
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
