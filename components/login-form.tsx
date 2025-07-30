"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get("error")
    const details = searchParams.get("details")

    if (errorParam) {
      switch (errorParam) {
        case "no_code":
          setError("Authorization code not received from Zoho")
          break
        case "auth_failed":
          setError(details ? `Authentication failed: ${details}` : "Authentication failed")
          break
        case "oauth_access_denied":
          setError("Access denied by user")
          break
        default:
          setError(`Authentication error: ${errorParam}`)
      }
    }
  }, [searchParams])

  const handleZohoLogin = () => {
    // Clear any existing errors
    setError(null)

    // Construct Zoho OAuth URL
    const zohoAuthUrl = new URL("https://accounts.zoho.com/oauth/v2/auth")
    zohoAuthUrl.searchParams.set("scope", "AaaServer.profile.READ")
    zohoAuthUrl.searchParams.set("client_id", process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID!)
    zohoAuthUrl.searchParams.set("response_type", "code")
    zohoAuthUrl.searchParams.set("redirect_uri", process.env.NEXT_PUBLIC_ZOHO_REDIRECT_URI!)
    zohoAuthUrl.searchParams.set("access_type", "offline")
    zohoAuthUrl.searchParams.set("prompt", "consent")

    console.log("Redirecting to Zoho OAuth:", zohoAuthUrl.toString())
    window.location.href = zohoAuthUrl.toString()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Ideas Portal</CardTitle>
          <CardDescription>Login with your Zoho account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleZohoLogin} className="w-full" size="lg">
            Login with Zoho SSO
          </Button>

          <div className="text-xs text-muted-foreground text-center space-y-2">
            <p>New users will be assigned the Initiator role by default.</p>
            <p>Contact your administrator for role changes.</p>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-2 bg-muted rounded text-left">
                <p className="font-semibold">Debug Info:</p>
                <p>Client ID: {process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID?.substring(0, 10)}...</p>
                <p>Redirect URI: {process.env.NEXT_PUBLIC_ZOHO_REDIRECT_URI}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
