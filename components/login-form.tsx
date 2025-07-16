"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const handleZohoLogin = () => {
    const zohoAuthUrl =
      `https://accounts.zoho.com/oauth/v2/auth?` +
      `scope=AaaServer.profile.READ&` +
      `client_id=${process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_ZOHO_REDIRECT_URI!)}&` +
      `access_type=offline`

    window.location.href = zohoAuthUrl
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Ideas Portal</CardTitle>
          <CardDescription>Login with your Zoho account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleZohoLogin} className="w-full" size="lg">
            Login with Zoho SSO
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            New users will be assigned the Initiator role by default. Contact your administrator for role changes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
