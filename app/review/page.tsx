"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ReviewInterface } from "@/components/review-interface"

export default function ReviewPage() {
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Review Ideas</h1>
          <p className="text-muted-foreground">Review and process ideas assigned to your role</p>
        </div>

        <ReviewInterface userRole={userRole} />
      </div>
    </DashboardLayout>
  )
}
