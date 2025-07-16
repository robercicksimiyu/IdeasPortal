import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface StatsCardsProps {
  userRole: string
}

export function StatsCards({ userRole }: StatsCardsProps) {
  // Mock data - in real app, this would come from API
  const getStatsForRole = (role: string) => {
    switch (role) {
      case "Initiator":
        return [
          { title: "My Ideas", value: "12", icon: FileText, color: "text-blue-600" },
          { title: "Pending Review", value: "3", icon: Clock, color: "text-yellow-600" },
          { title: "Approved", value: "7", icon: CheckCircle, color: "text-green-600" },
          { title: "Implemented", value: "2", icon: CheckCircle, color: "text-purple-600" },
        ]
      case "API Promoter":
        return [
          { title: "Pending Review", value: "8", icon: Clock, color: "text-yellow-600" },
          { title: "Reviewed Today", value: "3", icon: FileText, color: "text-blue-600" },
          { title: "Escalated", value: "2", icon: AlertCircle, color: "text-red-600" },
          { title: "Approved", value: "15", icon: CheckCircle, color: "text-green-600" },
        ]
      case "Ideas Committee":
        return [
          { title: "For Review", value: "5", icon: Clock, color: "text-yellow-600" },
          { title: "Scored Today", value: "2", icon: FileText, color: "text-blue-600" },
          { title: "High Priority", value: "3", icon: AlertCircle, color: "text-red-600" },
          { title: "Completed", value: "18", icon: CheckCircle, color: "text-green-600" },
        ]
      default:
        return [
          { title: "Total Ideas", value: "45", icon: FileText, color: "text-blue-600" },
          { title: "In Progress", value: "12", icon: Clock, color: "text-yellow-600" },
          { title: "Completed", value: "28", icon: CheckCircle, color: "text-green-600" },
          { title: "High Priority", value: "5", icon: AlertCircle, color: "text-red-600" },
        ]
    }
  }

  const stats = getStatsForRole(userRole)

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
