"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Eye, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Idea } from "@/lib/supabase"

interface EnhancedReviewInterfaceProps {
  userRole: string
}

interface ReviewFormData {
  action: string
  comments: string
  implementation_effort: string
  scores: {
    financial_score: number
    process_score: number
    impact_score: number
    customer_satisfaction_score: number
    ehs_score: number
    originality_score: number
  }
}

export function EnhancedReviewInterface({ userRole }: EnhancedReviewInterfaceProps) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [reviewData, setReviewData] = useState<ReviewFormData>({
    action: "",
    comments: "",
    implementation_effort: "",
    scores: {
      financial_score: 1,
      process_score: 1,
      impact_score: 1,
      customer_satisfaction_score: 1,
      ehs_score: 1,
      originality_score: 1,
    },
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    try {
      const response = await fetch("/api/ideas")
      if (response.ok) {
        const data = await response.json()
        // Filter ideas for BU Manager to only show those under implementation
        if (userRole === "BU Manager") {
          setIdeas(data.filter((idea: Idea) => idea.current_step === "IMPLEMENTATION"))
        } else {
          setIdeas(data)
        }
      }
    } catch (error) {
      console.error("Error fetching ideas:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalScore = () => {
    return Object.values(reviewData.scores).reduce((sum, score) => sum + score, 0)
  }

  const getScoreColor = (score: number) => {
    return score >= 12 ? "text-green-600" : "text-red-600"
  }

  const getScoreIcon = (score: number) => {
    return score >= 12 ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-600" />
    )
  }

  const handleScoreChange = (field: keyof ReviewFormData["scores"], value: number) => {
    setReviewData((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        [field]: value,
      },
    }))
  }

  const handleReviewSubmit = async () => {
    if (!selectedIdea || !reviewData.action) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/ideas/${selectedIdea.id}/enhanced-review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      })

      if (response.ok) {
        toast({
          title: "Review Submitted",
          description: `Your review for ${selectedIdea.idea_number} has been processed.`,
        })

        // Reset form and refresh ideas
        setSelectedIdea(null)
        setReviewData({
          action: "",
          comments: "",
          implementation_effort: "",
          scores: {
            financial_score: 1,
            process_score: 1,
            impact_score: 1,
            customer_satisfaction_score: 1,
            ehs_score: 1,
            originality_score: 1,
          },
        })
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
          { value: "escalate", label: "Escalate to Line Executive" },
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
      case "BU Manager":
        return [
          { value: "approve", label: "Mark as Implemented" },
        ]
      case "Admin":
        return [
          { value: "approve", label: "Approve for Implementation" },
          { value: "escalate", label: "Escalate to Line Executive" },
          { value: "reject", label: "Reject Idea" },
        ]
      default:
        return []
    }
  }

  const shouldShowImplementationEffort = () => {
    const rolesWithImplementationEffort = ["API Promoter", "Line Executive", "Admin"]
    return rolesWithImplementationEffort.includes(userRole)
  }

  if (!["API Promoter", "Ideas Committee", "Line Executive", "Admin", "BU Manager"].includes(userRole)) {
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
                      {userRole === "BU Manager" ? "Update Implementation" : "Review & Score"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Review Idea: {selectedIdea?.idea_number}</DialogTitle>
                    </DialogHeader>

                    {selectedIdea && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium">Idea</h4>
                          <p>{selectedIdea.subject}</p>
                          <h3 className="font-medium">Benefit </h3>
                          <p className="text-sm text-muted-foreground mt-1">{selectedIdea.expected_benefit}</p>
                        </div>

                        <Separator />

                        {/* Action Selection */}
                        <div className="space-y-2">
                          <Label>Review Action</Label>
                          <Select
                            value={reviewData.action}
                            onValueChange={(value) => setReviewData((prev) => ({ ...prev, action: value }))}
                          >
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

                        {/* Implementation Effort - Only for API Promoter and Line Executive */}
                        {shouldShowImplementationEffort() && (
                          <div className="space-y-2">
                            <Label>Implementation Effort</Label>
                            <Textarea
                              value={reviewData.implementation_effort}
                              onChange={(e) =>
                                setReviewData((prev) => ({ ...prev, implementation_effort: e.target.value }))
                              }
                              placeholder="Describe the implementation effort required..."
                              rows={3}
                            />
                          </div>
                        )}

                        {/* Scoring Section - Only shown for non-BU Manager roles */}
                        {userRole !== "BU Manager" && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Evaluation Criteria (1-3 scale)</h4>
                              <div className="flex items-center gap-2">
                                {getScoreIcon(getTotalScore())}
                                <span className={`font-semibold ${getScoreColor(getTotalScore())}`}>
                                  Total Score: {getTotalScore()}/18
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Financial Impact</Label>
                              <p className="text-xs text-muted-foreground">
                                Does the idea save cost or increase revenue?
                              </p>
                              <Select
                                value={reviewData.scores.financial_score.toString()}
                                onValueChange={(value) => handleScoreChange("financial_score", Number.parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 - Low Impact</SelectItem>
                                  <SelectItem value="2">2 - Medium Impact</SelectItem>
                                  <SelectItem value="3">3 - High Impact</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Process/Time/Manpower</Label>
                              <p className="text-xs text-muted-foreground">
                                Does the idea add value or eliminate unnecessary steps?
                              </p>
                              <Select
                                value={reviewData.scores.process_score.toString()}
                                onValueChange={(value) => handleScoreChange("process_score", Number.parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 - Low Impact</SelectItem>
                                  <SelectItem value="2">2 - Medium Impact</SelectItem>
                                  <SelectItem value="3">3 - High Impact</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Impact Scale</Label>
                              <p className="text-xs text-muted-foreground">
                                Does the idea benefit a large number of people?
                              </p>
                              <Select
                                value={reviewData.scores.impact_score.toString()}
                                onValueChange={(value) => handleScoreChange("impact_score", Number.parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 - Limited Impact</SelectItem>
                                  <SelectItem value="2">2 - Moderate Impact</SelectItem>
                                  <SelectItem value="3">3 - Wide Impact</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Customer Satisfaction</Label>
                              <p className="text-xs text-muted-foreground">
                                Does the idea improve customer satisfaction?
                              </p>
                              <Select
                                value={reviewData.scores.customer_satisfaction_score.toString()}
                                onValueChange={(value) =>
                                  handleScoreChange("customer_satisfaction_score", Number.parseInt(value))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 - Low Impact</SelectItem>
                                  <SelectItem value="2">2 - Medium Impact</SelectItem>
                                  <SelectItem value="3">3 - High Impact</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>EHS (Environment, Health, Safety)</Label>
                              <p className="text-xs text-muted-foreground">Does the idea improve EHS of employees?</p>
                              <Select
                                value={reviewData.scores.ehs_score.toString()}
                                onValueChange={(value) => handleScoreChange("ehs_score", Number.parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 - Low Impact</SelectItem>
                                  <SelectItem value="2">2 - Medium Impact</SelectItem>
                                  <SelectItem value="3">3 - High Impact</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Originality</Label>
                              <p className="text-xs text-muted-foreground">
                                Has the idea been originated by the individual?
                              </p>
                              <Select
                                value={reviewData.scores.originality_score.toString()}
                                onValueChange={(value) =>
                                  handleScoreChange("originality_score", Number.parseInt(value))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 - Not Original</SelectItem>
                                  <SelectItem value="2">2 - Somewhat Original</SelectItem>
                                  <SelectItem value="3">3 - Highly Original</SelectItem>
                                </SelectContent>
                              </Select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Comments */}
                        <div className="space-y-2">
                          <Label>Comments</Label>
                          <Textarea
                            value={reviewData.comments}
                            onChange={(e) => setReviewData((prev) => ({ ...prev, comments: e.target.value }))}
                            placeholder="Add your review comments..."
                            rows={3}
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setSelectedIdea(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleReviewSubmit} disabled={!reviewData.action || submitting}>
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
