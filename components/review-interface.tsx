"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Idea } from "@/lib/db"

interface ReviewInterfaceProps {
  userRole: string
}

export function ReviewInterface({ userRole }: ReviewInterfaceProps) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [reviewAction, setReviewAction] = useState("")
  const [comments, setComments] = useState("")
  const [score, setScore] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

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

  const handleReviewSubmit = async () => {
    if (!selectedIdea || !reviewAction) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/ideas/${selectedIdea.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: reviewAction,
          comments,
          score: userRole === "Ideas Committee" && score ? Number.parseInt(score) : undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: "Review Submitted",
          description: `Your review for ${selectedIdea.idea_number} has been processed.`,
        })

        // Reset form and refresh ideas
        setSelectedIdea(null)
        setReviewAction("")
        setComments("")
        setScore("")
        fetchIdeas()
      } else {
        throw new Error("Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getActionOptions = (role: string, currentStep: string) => {
    switch (role) {
      case "API Promoter":
        return [
          { value: "approve", label: "Approve for Implementation" },
          { value: "escalate", label: "Escalate to Ideas Committee" },
          { value: "reject", label: "Reject Idea" },
        ]
      case "Ideas Committee":
        return currentStep === "MONITORING"
          ? [
              { value: "approve", label: "Mark as Complete" },
              { value: "reject", label: "Needs More Work" },
            ]
          : [
              { value: "approve", label: "Approve and Score" },
              { value: "escalate", label: "Escalate to Line Executive" },
              { value: "reject", label: "Reject" },
            ]
      case "Line Executive":
        return [
          { value: "approve", label: "Final Approval" },
          { value: "reject", label: "Reject" },
        ]
      case "Admin":
        return [
          { value: "approve", label: "Approve for Implementation" },
          { value: "escalate", label: "Escalate to Ideas Committee" },
          { value: "reject", label: "Reject Idea" },
        ]
      default:
        return []
    }
  }

  if (!["API Promoter", "Ideas Committee", "Line Executive","Admin"].includes(userRole)) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Review functionality is not available for your role.</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading ideas for review...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {ideas.map((idea) => (
          <Card key={idea.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {idea.idea_number}: {idea.subject}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Submitted by {idea.submitter_name} on {new Date(idea.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{idea.workflow_version}</Badge>
                  <Badge
                    className={
                      idea.priority === "High"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        : idea.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    }
                  >
                    {idea.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Country</Label>
                  <p className="text-sm">{idea.country}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <p className="text-sm">{idea.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Step</Label>
                  <p className="text-sm">{idea.current_step.replace(/_/g, " ")}</p>
                </div>
              </div>

              <div className="mb-4">
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
              </div>

              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedIdea(idea)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Review Idea: {selectedIdea?.idea_number}</DialogTitle>
                    </DialogHeader>

                    {selectedIdea && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">{selectedIdea.subject}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{selectedIdea.description}</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Review Action</Label>
                          <Select value={reviewAction} onValueChange={setReviewAction}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                            <SelectContent>
                              {getActionOptions(userRole, selectedIdea.current_step).map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {userRole === "Ideas Committee" || userRole === "Admin"  &&
                          reviewAction === "approve" &&
                          selectedIdea.current_step !== "MONITORING" && (
                            <div className="space-y-2">
                              <Label>Score (1-10)</Label>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                placeholder="Enter score"
                              />
                            </div>
                          )}

                        <div className="space-y-2">
                          <Label>Comments</Label>
                          <Textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Add your review comments..."
                            rows={3}
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setSelectedIdea(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleReviewSubmit} disabled={!reviewAction || submitting}>
                            {submitting ? "Submitting..." : "Submit Review"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ideas.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No ideas pending review at this time.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
