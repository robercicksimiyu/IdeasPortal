import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

import { getUserById, getUserByZohoId } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {

    //console.log("cookie created:", response.cookies.get("user_id"));
    const userId = request.cookies.get("user_id")?.value

    console.log("Fetching user by ID:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByZohoId(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
