"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Edit } from "lucide-react"
import type { Idea } from "@/lib/db"
import { IdeaDetailView } from "@/components/idea-detail-view"

interface IdeasTableProps {
  userRole: string
}

export function IdeasTable({ userRole }: IdeasTableProps) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    try {
      const response = await fetch("/api/ideas")
      if (response.ok) {
        const data = await response.json()
        setIdeas(data)
      }
    } catch (error) {
      console.error("Error fetching ideas:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Pending Review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Escalated to Committee":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "Escalated to Executive":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Approved for Implementation":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Under Monitoring":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
      case "Completed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getTableTitle = (role: string) => {
    switch (role) {
      case "Initiator":
        return "My Submitted Ideas"
      case "API Promoter":
        return "Ideas Pending Review"
      case "Ideas Committee":
        return "Ideas for Committee Review"
      case "Line Executive":
        return "Ideas Requiring Approval"
      case "Business Unit Manager":
        return "Ideas for Implementation"
      case "Admin":
        return "All Ideas Overview"
      default:
        return "Ideas Dashboard"
    }
  }

   const openIdeaDetail = (ideaId: number) => {
    setSelectedIdeaId(ideaId)
    setIsDetailOpen(true)
  }

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading ideas...</p>
        </CardContent>
      </Card>
    )
  }

   return (
    <Card className="shadow-sm">
      <CardHeader className="bg-muted/50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">{getTableTitle(userRole)}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {ideas.length} {ideas.length === 1 ? "idea" : "ideas"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {ideas.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No ideas found for your role.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Benefit</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Country</TableHead>                  
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Submitted</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ideas.map((idea, index) => (
                  <TableRow key={idea.id} className={`hover:bg-muted/50 ${index % 2 === 0 ? "" : "bg-muted/25"}`}>
                    <TableCell className="font-mono text-sm font-medium text-primary">{idea.idea_number}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="font-medium truncate">{idea.subject}</div>
                      <div className="text-sm text-muted-foreground">by {idea.submitter_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-4 h-3 rounded-sm bg-muted mr-2"></div>
                        <span className="text-sm">{idea.expected_benefit}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{idea.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-4 h-3 rounded-sm bg-muted mr-2"></div>
                        <span className="text-sm">{idea.country}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`${getStatusColor(idea.status)} font-medium`}>{idea.status}</Badge>
                    </TableCell>
                    
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(idea.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-500/10"
                          onClick={() => openIdeaDetail(idea.id)}
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        {(userRole === "API Promoter" ||
                          userRole === "Ideas Committee" ||
                          userRole === "Line Executive") && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-500/10">
                            <Edit className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {selectedIdeaId && (
        <IdeaDetailView
          ideaId={selectedIdeaId}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedIdeaId(null)
          }}
          userRole={userRole}
          userId={1} // This should be the actual user ID
          onIdeaUpdate={fetchIdeas}
        />
      )}
    </Card>
  )
}
