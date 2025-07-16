"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

export function IdeaSubmissionForm() {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    country: "",
    department: "",
    workflowVersion: "v1" as "v1" | "v2",
    expectedBenefit: "",
    implementationEffort: "",
  })

  const router = useRouter()
  const { toast } = useToast()

  const countries = ["USA", "UK", "Canada", "Australia", "Germany", "France", "Japan"]
  const departments = [
    "Engineering",
    "Customer Success",
    "Finance",
    "Human Resources",
    "Marketing",
    "Sales",
    "Operations",
    "Legal",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Generate mock ID
    const ideaId = `ID-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`

    // In real app, this would be an API call
    console.log("Submitting idea:", { ...formData, id: ideaId })

    toast({
      title: "Idea Submitted Successfully!",
      description: `Your idea has been assigned ID: ${ideaId}`,
    })

    // Reset form
    setFormData({
      subject: "",
      description: "",
      country: "",
      department: "",
      workflowVersion: "v1",
      expectedBenefit: "",
      implementationEffort: "",
    })

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push("/dashboard")
    }, 2000)
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Submit New Idea</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Idea Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of your idea"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Provide a detailed explanation of your idea, including current challenges and proposed solution"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedBenefit">Expected Benefits</Label>
            <Textarea
              id="expectedBenefit"
              value={formData.expectedBenefit}
              onChange={(e) => setFormData((prev) => ({ ...prev, expectedBenefit: e.target.value }))}
              placeholder="What benefits do you expect from implementing this idea?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="implementationEffort">Implementation Effort</Label>
            <Textarea
              id="implementationEffort"
              value={formData.implementationEffort}
              onChange={(e) => setFormData((prev) => ({ ...prev, implementationEffort: e.target.value }))}
              placeholder="Estimate the effort required to implement this idea"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Workflow Version</Label>
            <RadioGroup
              value={formData.workflowVersion}
              onValueChange={(value: "v1" | "v2") => setFormData((prev) => ({ ...prev, workflowVersion: value }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="v1" id="v1" />
                <Label htmlFor="v1">Version 1 (Current Process)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="v2" id="v2" />
                <Label htmlFor="v2">Version 2 (New Process)</Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              {formData.workflowVersion === "v1"
                ? "Ideas will be reviewed by API Promoter first, then escalated to Ideas Committee if needed."
                : "Ideas will go directly to Divisional Ideas Committee for scoring and review."}
            </p>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              Submit Idea
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
