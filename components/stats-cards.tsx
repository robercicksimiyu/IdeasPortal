"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface StatsCardsProps {
  userRole: string
}



      
export function StatsCards({ userRole, userId }: StatsCardsProps) {
  const [stats, setStats] = useState([{ title: "Loading...", value: "0", icon: FileText, color: "text-blue-600" }])

  useEffect(() => {
    fetchStats()
  }, [userRole])

  const fetchStats = async () => {
    try {
      // Get stats based on user role
      const statsData = await getStatsForRole(userRole)
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  

  const getStatsForRole = async (role: string) => {
    switch (role) {
      case "Initiator":
        const { count: myIdeas } = await supabase
          .from("ideas")
          .select("*", { count: "exact", head: true })
          .eq("submitter_id", userId) // This should be dynamic based on current user

        const { count: pending } = await supabase
          .from("ideas")
          .select("*", { count: "exact", head: true })
          .eq("submitter_id", userId)
          .in("status", ["Submitted", "Pending Review"])

        const { count: approved } = await supabase
          .from("ideas")
          .select("*", { count: "exact", head: true })
          .eq("submitter_id", userId)
          .in("status", ["Approved for Implementation", "Under Monitoring"])

        const { count: implemented } = await supabase
          .from("ideas")
          .select("*", { count: "exact", head: true })
          .eq("submitter_id", userId)
          .eq("status", "Completed")

        return [
          { title: "My Ideas", value: (myIdeas || 0).toString(), icon: FileText, color: "text-blue-600" },
          { title: "Pending Review", value: (pending || 0).toString(), icon: Clock, color: "text-yellow-600" },
          { title: "Approved", value: (approved || 0).toString(), icon: CheckCircle, color: "text-green-600" },
          { title: "Implemented", value: (implemented || 0).toString(), icon: CheckCircle, color: "text-purple-600" },
        ]

      case "API Promoter":
        const { count: pendingReview } = await supabase
          .from("ideas")
          .select("*", { count: "exact", head: true })
          .eq("current_step", "API_PROMOTER_REVIEW")

        const { count: reviewedToday } = await supabase
          .from("workflow_steps")
          .select("*", { count: "exact", head: true })
          .eq("assigned_role", "API Promoter")
          .eq("status", "Completed")
          .gte("completed_at", new Date().toISOString().split("T")[0])

        const { count: escalated } = await supabase
          .from("ideas")
          .select("*", { count: "exact", head: true })
          .in("status", ["Escalated to Committee", "Escalated to Executive"])

        const { count: approvedByPromoter } = await supabase
          .from("workflow_steps")
          .select("*", { count: "exact", head: true })
          .eq("assigned_role", "API Promoter")
          .eq("action_taken", "approve")

        return [
          { title: "Pending Review", value: (pendingReview || 0).toString(), icon: Clock, color: "text-yellow-600" },
          { title: "Reviewed Today", value: (reviewedToday || 0).toString(), icon: FileText, color: "text-blue-600" },
          { title: "Escalated", value: (escalated || 0).toString(), icon: AlertCircle, color: "text-red-600" },
          {
            title: "Approved",
            value: (approvedByPromoter || 0).toString(),
            icon: CheckCircle,
            color: "text-green-600",
          },
        ]

      default:
        const { count: totalIdeas } = await supabase.from("ideas").select("*", { count: "exact", head: true })

        const { count: approved_implementation } = await supabase
          .from("ideas")
          .select("*", { count: "exact", head: true })
          .in("status", ["Approved for Implementation"])

        const { count: implemented_ideas } = await supabase
          .from("ideas")
          .select("*", { count: "exact", head: true })
          .eq("current_step", "Implemented")

        const { count: underReview } = await supabase
          .from("ideas")
          .select("*", { count: "exact", head: true })
          .in("current_step", ["API_PROMOTER_REVIEW"])

        const { count: rejected_ideas } = await supabase
          .from("ideas")
          .select("*", { count: "exact", head: true })
          .in("status", ["Rejected"])

        return [
          { title: "Implementing", value: (approved_implementation || 0).toString(), icon: Clock, color: "text-yellow-600" },
          { title: "Under Review", value: (underReview || 0).toString(), icon: CheckCircle, color: "text-green-600" },
          { title: "Implemented", value: (implemented_ideas || 0).toString(), icon: AlertCircle, color: "text-red-600" },
          { title: "Rejected", value: (implemented_ideas || 0).toString(), icon: AlertCircle, color: "text-red-600" },
        ]
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div
                className={`p-2 rounded-lg ${
                  stat.color === "text-blue-600"
                    ? "bg-blue-500/10 dark:bg-blue-500/20"
                    : stat.color === "text-yellow-600"
                      ? "bg-yellow-500/10 dark:bg-yellow-500/20"
                      : stat.color === "text-green-600"
                        ? "bg-green-500/10 dark:bg-green-500/20"
                        : stat.color === "text-red-600"
                          ? "bg-red-500/10 dark:bg-red-500/20"
                          : stat.color === "text-purple-600"
                            ? "bg-purple-500/10 dark:bg-purple-500/20"
                            : "bg-gray-500/10 dark:bg-gray-500/20"
                }`}
              >
                <Icon className={`h-5 w-5 ${stat.color} dark:opacity-90`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    stat.color === "text-blue-600"
                      ? "bg-blue-500"
                      : stat.color === "text-yellow-600"
                        ? "bg-yellow-500"
                        : stat.color === "text-green-600"
                          ? "bg-green-500"
                          : stat.color === "text-red-600"
                            ? "bg-red-500"
                            : stat.color === "text-purple-600"
                              ? "bg-purple-500"
                              : "bg-gray-500"
                  }`}
                ></div>
                Updated recently
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
