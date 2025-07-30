"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DepartmentManagement } from "@/components/department-management"
import type { User } from "@/lib/supabase"

export default function DepartmentsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)

        // Check if user is admin
        if (!userData.is_admin) {
          router.push("/dashboard")
          return
        }
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Department Management</h1>
          <p className="text-muted-foreground">Manage departments and sync with location data</p>
        </div>

        <DepartmentManagement />
      </div>
    </DashboardLayout>
  )
}
