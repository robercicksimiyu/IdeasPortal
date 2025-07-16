"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { IdeaSubmissionForm } from "@/components/idea-submission-form"

export default function SubmitPage() {
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
          <h1 className="text-3xl font-bold">Submit New Idea</h1>
          <p className="text-muted-foreground">Share your improvement ideas with the team</p>
        </div>

        <IdeaSubmissionForm />
      </div>
    </DashboardLayout>
  )
}
