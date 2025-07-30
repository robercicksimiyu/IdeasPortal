import { type NextRequest, NextResponse } from "next/server"
import { createOrUpdateUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url))
  }

  console.log("Received Zoho OAuth code:", {
    code,
    clientId: process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_ZOHO_REDIRECT_URI,
    zohoClientId: process.env.ZOHO_CLIENT_ID,
    zohoRedirectUri: process.env.ZOHO_REDIRECT_URI,
    zohoClientSecret: process.env.ZOHO_CLIENT_SECRET, 
  });

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID!,
        client_secret: process.env.ZOHO_CLIENT_SECRET!,
        redirect_uri: process.env.NEXT_PUBLIC_ZOHO_REDIRECT_URI!,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    console.log("Zoho token response:", tokenData);

    if (!tokenData.access_token) {
      throw new Error("Failed to get access token")
    }

    // Get user info from Zoho
    const userResponse = await fetch("https://accounts.zoho.com/oauth/user/info", {
      headers: {
        Authorization: `Zoho-oauthtoken ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()
    console.log("Zoho user info:", userData);
   // Create or update user in database
    const user = await createOrUpdateUser({
      zoho_id: userData.ZUID,
      email: userData.Email,
      name: userData.Display_Name || userData.First_Name + " " + userData.Last_Name,
      country: userData.Country,
    })

    // Create session (in production, use proper session management)
    const response = NextResponse.redirect(new URL("/dashboard", request.url))
    response.cookies.set("user_id", userData.ZUID.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log("cookie created:", response.cookies.get("user_id"));

    return response
  } catch (error) {
    console.error("Zoho OAuth error:", error)
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url))
  }
}
