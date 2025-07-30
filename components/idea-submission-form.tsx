"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

interface Country {
  id: number
  name: string
}

interface Department {
  id: number
  department_name: string
  department_code: string
  country: string
  cluster: string
}

interface Cluster {
  id: number
  name: string
  country: string
}

interface ApiPromoter {
  id: number
  name: string
}

export function IdeaSubmissionForm() {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    country: "",
    department: "",
    cluster: "",
    apiPromoter: "",
    workflowVersion: "v2" as "v1" | "v2",
    expectedBenefit: "",
    implementationEffort: "",
  })

  const [countries, setCountries] = useState<Country[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [apiPromoters, setApiPromoters] = useState<ApiPromoter[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const { toast } = useToast()

  // Fetch initial data
  useEffect(() => {
    fetchCountries()
  }, [])

  // Fetch departments and clusters when country changes
  useEffect(() => {
    if (formData.country) {
      fetchDepartments(formData.country)
      fetchClusters(formData.country)
      fetchApiPromoters(formData.country)
    } else {
      setDepartments([])
      setClusters([])
      setApiPromoters([])
    }
    // Reset dependent fields when country changes
    setFormData((prev) => ({
      ...prev,
      department: "",
      cluster: "",
      apiPromoter: "",
    }))
  }, [formData.country])

  const fetchCountries = async () => {
    try {
      const response = await fetch("/api/form-data/countries")
      if (response.ok) {
        const data = await response.json()
        setCountries(data)
      }
    } catch (error) {
      console.error("Error fetching countries:", error)
      toast({
        title: "Error",
        description: "Failed to load countries",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async (country: string) => {
    try {
      const response = await fetch(`/api/form-data/departments?country=${encodeURIComponent(country)}`)
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  }

  const fetchClusters = async (country: string) => {
    try {
      const response = await fetch(`/api/form-data/clusters?country=${encodeURIComponent(country)}`)
      if (response.ok) {
        const data = await response.json()
        setClusters(data)
      }
    } catch (error) {
      console.error("Error fetching clusters:", error)
    }
  }

  const fetchApiPromoters = async (country: string, department?: string) => {
    try {
      const params = new URLSearchParams({ country })
      if (department) params.append("department", department)

      const response = await fetch(`/api/form-data/api-promoters?${params}`)
      if (response.ok) {
        const data = await response.json()
        setApiPromoters(data)
      }
    } catch (error) {
      console.error("Error fetching API promoters:", error)
    }
  }

  // Refetch API promoters when department changes
  useEffect(() => {
    if (formData.country && formData.department) {
      fetchApiPromoters(formData.country, formData.department)
    }
    // Reset API promoter when department changes
    setFormData((prev) => ({ ...prev, apiPromoter: "" }))
  }, [formData.department])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit idea")
      }

      const result = await response.json()
      toast({
        title: "Idea Submitted Successfully!",
        description: `Your idea has been assigned ID: ${result.idea_number}`,
      })

      // Reset form
      setFormData({
        subject: "",
        description: "",
        country: "",
        department: "",
        cluster: "",
        apiPromoter: "",
        workflowVersion: "v2",
        expectedBenefit: "",
        implementationEffort: "",
      })

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Submit error:", error)
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Submit New Kaizen Idea</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Affected Country *</Label>
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
                    <SelectItem key={country.id} value={country.name}>
                      {country.name}
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
                disabled={!formData.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.country ? "Select department" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.department_name}>
                      {dept.department_name} ({dept.department_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cluster">Affected Cluster *</Label>
              <Select
                value={formData.cluster}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, cluster: value }))}
                required
                disabled={!formData.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.country ? "Select cluster" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {clusters.map((cluster) => (
                    <SelectItem key={cluster.id} value={cluster.name}>
                      {cluster.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiPromoter">API Promoter *</Label>
              <Select
                value={formData.apiPromoter}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, apiPromoter: value }))}
                required
                disabled={!formData.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.country ? "Select API promoter" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {apiPromoters.map((promoter) => (
                    <SelectItem key={promoter.id} value={promoter.name}>
                      {promoter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Kaizen Idea *</Label>
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
