import { Suspense } from "react"
import { LoginForm } from "@/components/login-form"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
