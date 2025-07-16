import { LoginForm } from "@/components/login-form"

export default function HomePage() {
  // In a real app, check if user is authenticated
  // For now, redirect to login
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoginForm />
    </div>
  )
}
