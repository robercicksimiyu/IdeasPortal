"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { IdeasTable } from "@/components/ideas-table"
import { StatsCards } from "@/components/stats-cards"

export default function DashboardPage() {
  const [userRole, setUserRole] = useState("")
  const [userName, setUserName] = useState("")
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const name = localStorage.getItem("userName")

    if (!role) {
      router.push("/")
      return
    }

    setUserRole(role)
    setUserName(name || "User")
  }, [router])

  if (!userRole) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName}>
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">
            Welcome back, <span className="font-semibold">{userName}</span>
          </p>
        </div>

        <StatsCards userRole={userRole} />
        <IdeasTable userRole={userRole} />
      </div>
    </DashboardLayout>
  )
}
