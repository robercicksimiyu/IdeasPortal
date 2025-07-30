"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, MessageSquare, Clock, CheckCircle, AlertTriangle, Users, UserCheck } from "lucide-react"
import type { Idea } from "@/lib/supabase"

interface WorkflowOverviewProps {
  userRole: string
}

interface IdeaWithComments extends Idea {
  submitter_name: string
  recent_comments: Array<{
    id: number
    comment: string
    comment_type: string
    created_at: string
    user_name: string
  }>
  workflow_steps: Array<{
    id: number
    step_name: string
    assigned_role: string
    status: string
    action_taken?: string
    comments?: string
    score?: number
    completed_at?: string
    created_at: string
  }>
}

export function WorkflowOverview({ userRole }: WorkflowOverviewProps) {
  const [approvedIdeas, setApprovedIdeas] = useState<IdeaWithComments[]>([])
  const [executiveReview, setExecutiveReview] = useState<IdeaWithComments[]>([])
  const [committeeReview, setCommitteeReview] = useState<IdeaWithComments[]>([])
  const [recentComments, setRecentComments] = useState<IdeaWithComments[]>([])
  const [selectedIdea, setSelectedIdea] = useState<IdeaWithComments | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkflowData()
  }, [])

  const fetchWorkflowData = async () => {
    try {
      const [approvedRes, executiveRes, committeeRes, commentsRes] = await Promise.all([
        fetch("/api/workflow/approved"),
        fetch("/api/workflow/executive-review"),
        fetch("/api/workflow/committee-review"),
        fetch("/api/workflow/recent-comments"),
      ])

      if (approvedRes.ok) setApprovedIdeas(await approvedRes.json())
      if (executiveRes.ok) setExecutiveReview(await executiveRes.json())
      if (committeeRes.ok) setCommitteeReview(await committeeRes.json())
      if (commentsRes.ok) setRecentComments(await commentsRes.json())
    } catch (error) {
      console.error("Error fetching workflow data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved for Implementation":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Escalated to Executive":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "Escalated to Committee":
        return <Users className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved for Implementation":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Escalated to Executive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Escalated to Committee":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "Under Monitoring":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const IdeaTable = ({
    ideas,
    title,
    emptyMessage,
  }: { ideas: IdeaWithComments[]; title: string; emptyMessage: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          <Badge variant="outline">{ideas.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ideas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ideas.map((idea) => (
                  <TableRow key={idea.id}>
                    <TableCell className="font-mono text-sm">{idea.idea_number}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="font-medium truncate">{idea.subject}</div>
                      <div className="text-sm text-muted-foreground">{idea.department}</div>
                    </TableCell>
                    <TableCell>{idea.submitter_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(idea.status)}
                        <Badge className={getStatusColor(idea.status)}>{idea.status}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          idea.priority === "High"
                            ? "destructive"
                            : idea.priority === "Medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {idea.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(idea.updated_at)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedIdea(idea)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>
                              {selectedIdea?.idea_number}: {selectedIdea?.subject}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedIdea && <IdeaDetails idea={selectedIdea} />}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const IdeaDetails = ({ idea }: { idea: IdeaWithComments }) => (
    <ScrollArea className="max-h-[60vh]">
      <div className="space-y-6 pr-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Basic Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Country:</strong> {idea.country}
              </div>
              <div>
                <strong>Department:</strong> {idea.department}
              </div>
              <div>
                <strong>Workflow:</strong> {idea.workflow_version}
              </div>
              <div>
                <strong>Priority:</strong> {idea.priority}
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Status</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Current Status:</strong> {idea.status}
              </div>
              <div>
                <strong>Current Step:</strong> {idea.current_step.replace(/_/g, " ")}
              </div>
              <div>
                <strong>Submitted:</strong> {formatDate(idea.created_at)}
              </div>
              <div>
                <strong>Last Updated:</strong> {formatDate(idea.updated_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="font-semibold mb-2">Description</h4>
          <p className="text-sm text-muted-foreground">{idea.description}</p>
        </div>

        {/* Benefits & Implementation */}
        {(idea.expected_benefit || idea.implementation_effort) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {idea.expected_benefit && (
              <div>
                <h4 className="font-semibold mb-2">Expected Benefits</h4>
                <p className="text-sm text-muted-foreground">{idea.expected_benefit}</p>
              </div>
            )}
            {idea.implementation_effort && (
              <div>
                <h4 className="font-semibold mb-2">Implementation Effort</h4>
                <p className="text-sm text-muted-foreground">{idea.implementation_effort}</p>
              </div>
            )}
          </div>
        )}

        {/* Workflow Steps */}
        <div>
          <h4 className="font-semibold mb-2">Workflow History</h4>
          <div className="space-y-2">
            {idea.workflow_steps.map((step) => (
              <div key={step.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{step.step_name.replace(/_/g, " ")}</Badge>
                    <Badge variant={step.status === "Completed" ? "default" : "secondary"}>{step.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {step.completed_at ? formatDate(step.completed_at) : formatDate(step.created_at)}
                  </div>
                </div>
                <div className="text-sm">
                  <div>
                    <strong>Assigned to:</strong> {step.assigned_role}
                  </div>
                  {step.action_taken && (
                    <div>
                      <strong>Action:</strong> {step.action_taken}
                    </div>
                  )}
                  {step.score && (
                    <div>
                      <strong>Score:</strong> {step.score}/10
                    </div>
                  )}
                  {step.comments && (
                    <div className="mt-2">
                      <strong>Comments:</strong>
                      <p className="text-muted-foreground mt-1">{step.comments}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Comments */}
        {idea.recent_comments.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Recent Comments</h4>
            <div className="space-y-2">
              {idea.recent_comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{comment.comment_type}</Badge>
                      <span className="text-sm font-medium">{comment.user_name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading workflow data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{approvedIdeas.length}</div>
                <div className="text-sm text-muted-foreground">Approved for Implementation</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{executiveReview.length}</div>
                <div className="text-sm text-muted-foreground">Executive Review</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{committeeReview.length}</div>
                <div className="text-sm text-muted-foreground">Committee Review</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{recentComments.length}</div>
                <div className="text-sm text-muted-foreground">Recent Activity</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="approved" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approvedIdeas.length})
          </TabsTrigger>
          <TabsTrigger value="executive" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Executive ({executiveReview.length})
          </TabsTrigger>
          <TabsTrigger value="committee" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Committee ({committeeReview.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Recent Activity ({recentComments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approved">
          <IdeaTable
            ideas={approvedIdeas}
            title="Ideas Approved for Implementation"
            emptyMessage="No ideas are currently approved for implementation."
          />
        </TabsContent>

        <TabsContent value="executive">
          <IdeaTable
            ideas={executiveReview}
            title="Ideas Under Executive Review"
            emptyMessage="No ideas are currently under executive review."
          />
        </TabsContent>

        <TabsContent value="committee">
          <IdeaTable
            ideas={committeeReview}
            title="Ideas Under Committee Review"
            emptyMessage="No ideas are currently under committee review."
          />
        </TabsContent>

        <TabsContent value="activity">
          <IdeaTable
            ideas={recentComments}
            title="Ideas with Recent Comments"
            emptyMessage="No recent comment activity."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
