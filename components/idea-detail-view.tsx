"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ThumbsUp,
  ThumbsDown,
  Edit,
  MessageSquare,
  Calendar,
  User,
  Building,
  MapPin,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FileViewer } from "@/components/file-viewer"

interface IdeaDetailProps {
  ideaId: number
  isOpen: boolean
  onClose: () => void
  userRole: string
  userId: number
  onIdeaUpdate?: () => void
}

interface IdeaDetail {
  id: number
  idea_number: string
  subject: string
  description: string
  country: string
  department: string
  cluster: string
  workflow_version: string
  expected_benefit?: string
  implementation_effort?: string
  priority: string
  status: string
  current_step: string
  vote_count: number
  submitter_id: number
  idea_attachments: Array<{
    id: number
    file_name: string
    file_type: string
    file_size: number
    cloudinary_url: string
    cloudinary_secure_url: string
    uploaded_at?: string
  }>
  created_at: string
  updated_at: string
  submitter_name: string
  user_vote?: "upvote" | "downvote" | null
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
    implementation_effort?: string
    idea_scores?: {
      financial_score: number
      process_score: number
      impact_score: number
      customer_satisfaction_score: number
      ehs_score: number
      originality_score: number
      total_score: number
      comments?: string
    }
  }>
}

export function IdeaDetailView({ ideaId, isOpen, onClose, userRole, userId, onIdeaUpdate }: IdeaDetailProps) {
  const [idea, setIdea] = useState<IdeaDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    subject: "",
    description: "",
    expected_benefit: "",
  })
  const [newComment, setNewComment] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && ideaId) {
      fetchIdeaDetail()
    }
  }, [isOpen, ideaId])

  const fetchIdeaDetail = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ideas/${ideaId}/detail`)
      if (response.ok) {
        const data = await response.json()
        setIdea(data)
        setEditData({
          subject: data.subject,
          description: data.description,
          expected_benefit: data.expected_benefit || "",
        })
      }
    } catch (error) {
      console.error("Error fetching idea detail:", error)
      toast({
        title: "Error",
        description: "Failed to load idea details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (voteType: "upvote" | "downvote") => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vote_type: voteType }),
      })

      if (response.ok) {
        const result = await response.json()
        // Refetch the idea details to get updated vote count and status
        await fetchIdeaDetail()
        toast({
          title: "Vote Recorded",
          description: `Your ${voteType} has been recorded`,
        })
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Idea updated successfully",
        })
        setIsEditing(false)
        fetchIdeaDetail()
        onIdeaUpdate?.()
      }
    } catch (error) {
      console.error("Error updating idea:", error)
      toast({
        title: "Error",
        description: "Failed to update idea",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/ideas/${ideaId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: newComment }),
      })

      if (response.ok) {
        toast({
          title: "Comment Added",
          description: "Your comment has been added",
        })
        setNewComment("")
        fetchIdeaDetail()
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  const canEdit = idea && (userRole === "Admin" || userRole === "Ideas Committee" || idea.submitter_id === userId)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Approved for Implementation":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Completed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 12) return "text-green-600"
    return "text-red-600"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 12) return <CheckCircle className="h-4 w-4 text-green-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }
  

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {idea?.idea_number}: {idea?.subject}
            </span>
            {canEdit && !isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : idea ? (
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{idea.submitter_name}</p>
                    <p className="text-xs text-muted-foreground">Submitter</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{idea.department}</p>
                    <p className="text-xs text-muted-foreground">Department</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{idea.country}</p>
                    <p className="text-xs text-muted-foreground">{idea.cluster}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{new Date(idea.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">Submitted</p>
                  </div>
                </div>
              </div>

              {/* Status and Voting */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(idea.status)}>{idea.status}</Badge>
                  <Badge variant="outline">{idea.workflow_version}</Badge>
                  <Badge variant={idea.priority === "High" ? "destructive" : "secondary"}>{idea.priority}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={idea.user_vote === "upvote" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleVote("upvote")}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {idea.vote_count}
                  </Button>
                  <Button
                    variant={idea.user_vote === "downvote" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => handleVote("downvote")}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Idea Content */}
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-subject">Subject</Label>
                    <Textarea
                      id="edit-subject"
                      value={editData.subject}
                      onChange={(e) => setEditData((prev) => ({ ...prev, subject: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Idea</Label>
                    <Textarea
                      id="edit-description"
                      value={editData.description}
                      onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-benefit">Expected Benefits</Label>
                    <Textarea
                      id="edit-benefit"
                      value={editData.expected_benefit}
                      onChange={(e) => setEditData((prev) => ({ ...prev, expected_benefit: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleEdit}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Idea</h4>
                    <p className="text-sm text-muted-foreground">{idea.description}</p>
                  </div>
                  {idea.expected_benefit && (
                    <div>
                      <h4 className="font-semibold mb-2">Expected Benefits</h4>
                      <p className="text-sm text-muted-foreground">{idea.expected_benefit}</p>
                    </div>
                  )}

                  {/* Supporting Documents Section */}
                  {idea.idea_attachments && idea.idea_attachments.length > 0 && (
                    <div className="mt-6">
                      <FileViewer 
                        files={idea.idea_attachments}
                        title="Supporting Documents"
                      />
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {/* Workflow History */}
              <div>
                <h4 className="font-semibold mb-4">Review History</h4>
                <div className="space-y-4">
                  {idea.workflow_steps.map((step) => ( 
                    <Card key={step.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{step.step_name?.replace(/_/g, " ") || "Unknown Step"}</Badge>
                          <Badge variant={step.status === "Completed" ? "default" : "secondary"}>{step.status}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {step.completed_at
                            ? new Date(step.completed_at).toLocaleDateString()
                            : new Date(step.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {step.action_taken && (
                        <p className="text-sm mb-2">
                          <strong>Action:</strong> {step.action_taken}
                        </p>
                      )}

                      {step.comments && (
                        <p className="text-sm mb-2">
                          <strong>Comments:</strong> {step.comments}
                        </p>
                      )}

                      {step.implementation_effort && (
                        <p className="text-sm mb-2">
                          <strong>Implementation Effort:</strong> {step.implementation_effort}
                        </p>
                      )}

                      {step.idea_scores && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            {getScoreIcon(step.idea_scores.total_score)}
                            <span className={`font-semibold ${getScoreColor(step.idea_scores.total_score)}`}>
                              Total Score: {step.idea_scores.total_score}/18
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            <div>Financial: {step.idea_scores.financial_score}/3</div>
                            <div>Process: {step.idea_scores.process_score}/3</div>
                            <div>Impact: {step.idea_scores.impact_score}/3</div>
                            <div>Customer: {step.idea_scores.customer_satisfaction_score}/3</div>
                            <div>EHS: {step.idea_scores.ehs_score}/3</div>
                            <div>Originality: {step.idea_scores.originality_score}/3</div>
                          </div>
                          {step.idea_scores.comments && (
                            <p className="text-sm mt-2 text-muted-foreground">{step.idea_scores.comments}</p>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Add Comment */}
              <div>
                <h4 className="font-semibold mb-2">Add Comment</h4>
                <div className="space-y-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add your comment..."
                    rows={3}
                  />
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load idea details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
