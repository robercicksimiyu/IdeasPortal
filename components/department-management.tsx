"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Building2,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Department {
  id: number
  department_code: string
  department_name: string
  country: string
  cluster: string
  created_at: string
}

interface LocationData {
  Code: string
  Name: string
  Zone: string
  Address: string
  City: string
  Country_Region_Code: string
  Phone_No: string
  E_Mail: string
}

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [locations, setLocations] = useState<LocationData[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [syncLoading, setSyncLoading] = useState(false)
  const [formData, setFormData] = useState({
    department_code: "",
    department_name: "",
    country: "",
    cluster: "",
  })
  const [selectedCountry, setSelectedCountry] = useState("")
  const { toast } = useToast()

  const countries = ["KENYA", "UGANDA", "TANZANIA", "RWANDA", "ETHIOPIA"]

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments")
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const syncLocations = async (country: string) => {
    setSyncLoading(true)
    try {
      const response = await fetch(`/api/departments/sync-locations?country=${country}`)
      if (response.ok) {
        const data = await response.json()
        setLocations(data.locations)
        toast({
          title: "Sync Successful",
          description: `Fetched ${data.locations.length} locations from ${country}`,
        })
      } else {
        throw new Error("Failed to sync locations")
      }
    } catch (error) {
      console.error("Error syncing locations:", error)
      toast({
        title: "Sync Failed",
        description: "Failed to fetch locations from API",
        variant: "destructive",
      })
    } finally {
      setSyncLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Department created successfully",
        })
        setIsCreateDialogOpen(false)
        setFormData({ department_code: "", country: "", cluster: "", department_name })
        fetchDepartments()
      } else {
        throw new Error("Failed to create department")
      }
    } catch (error) {
      console.error("Error creating department:", error)
      toast({
        title: "Error",
        description: "Failed to create department",
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async () => {
    if (!selectedDepartment) return

    try {
      const response = await fetch(`/api/departments/${selectedDepartment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Department updated successfully",
        })
        setIsEditDialogOpen(false)
        setSelectedDepartment(null)
        setFormData({ department_code: "", country: "", cluster: "" })
        fetchDepartments()
      } else {
        throw new Error("Failed to update department")
      }
    } catch (error) {
      console.error("Error updating department:", error)
      toast({
        title: "Error",
        description: "Failed to update department",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedDepartment) return

    try {
      const response = await fetch(`/api/departments/${selectedDepartment.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Department deleted successfully",
        })
        setIsDeleteDialogOpen(false)
        setSelectedDepartment(null)
        fetchDepartments()
      } else {
        throw new Error("Failed to delete department")
      }
    } catch (error) {
      console.error("Error deleting department:", error)
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (department: Department) => {
    setSelectedDepartment(department)
    setFormData({
      department_code: department.department_code,
      department_name: department.department_name,
      country: department.country,
      cluster: department.cluster,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (department: Department) => {
    setSelectedDepartment(department)
    setIsDeleteDialogOpen(true)
  }

  const createDepartmentFromLocation = async (location: LocationData) => {
    const newDepartment = {
      department_code: location.Code,
      department_name: departments.find((d) => d.department_code === location.Code)?.department_name || location.Name,
      country: selectedCountry,
      cluster: location.Zone || location.City,
    }

    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDepartment),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Department created from location: ${location.Name}`,
        })
        fetchDepartments()
      } else {
        throw new Error("Failed to create department from location")
      }
    } catch (error) {
      console.error("Error creating department from location:", error)
      toast({
        title: "Error",
        description: "Failed to create department from location",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading departments...</p>
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
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{departments.length}</div>
                <div className="text-sm text-muted-foreground">Total Departments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{new Set(departments.map((d) => d.country)).size}</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{new Set(departments.map((d) => d.cluster)).size}</div>
                <div className="text-sm text-muted-foreground">Clusters</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{locations.length}</div>
                <div className="text-sm text-muted-foreground">Synced Locations</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="locations">Location Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Department Management</CardTitle>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Department</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="department_code">Department Code</Label>
                        <Input
                          id="department_code"
                          value={formData.department_code}
                          onChange={(e) => setFormData((prev) => ({ ...prev, department_code: e.target.value }))}
                          placeholder="Enter department code"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={formData.country}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
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
                        <Label htmlFor="cluster">Cluster</Label>
                        <Input
                          id="cluster"
                          value={formData.cluster}
                          onChange={(e) => setFormData((prev) => ({ ...prev, cluster: e.target.value }))}
                          placeholder="Enter cluster name"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreate}>Create Department</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department Code</TableHead>
                      <TableHead>Department Name</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Cluster</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell className="font-medium">{department.department_code}</TableCell>
                        <TableCell className="font-medium">{department.department_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{department.country}</Badge>
                        </TableCell>
                        <TableCell>{department.cluster}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(department.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(department)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(department)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Location Data Sync</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="sync-country">Select Country to Sync</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
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
                <Button
                  onClick={() => selectedCountry && syncLocations(selectedCountry)}
                  disabled={!selectedCountry || syncLoading}
                >
                  {syncLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Sync Locations
                </Button>
              </div>

              {locations.length > 0 && (
                <div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Found {locations.length} locations. Click "Create Department" to add them to your system.
                    </AlertDescription>
                  </Alert>

                  <div className="mt-4 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Zone/City</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {locations.map((location) => (
                          <TableRow key={location.Code}>
                            <TableCell className="font-medium">{location.Code}</TableCell>
                            <TableCell>{location.Name}</TableCell>
                            <TableCell>{location.Zone || location.City}</TableCell>
                            <TableCell className="max-w-xs truncate">{location.Address}</TableCell>
                            <TableCell>{location.Phone_No}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => createDepartmentFromLocation(location)}
                                disabled={departments.some((d) => d.department_code === location.Code)}
                              >
                                {departments.some((d) => d.department_code === location.Code) ? (
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                ) : (
                                  <Plus className="h-4 w-4 mr-2" />
                                )}
                                {departments.some((d) => d.department_code === location.Code)
                                  ? "Added"
                                  : "Create Department"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_department_code">Department Code</Label>
              <Input
                id="edit_department_code"
                value={formData.department_code}
                onChange={(e) => setFormData((prev) => ({ ...prev, department_code: e.target.value }))}
                placeholder="Enter department code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_country_string">Country</Label>
              <Select
                value={formData.country_string}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, country_string: value }))}
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
              <Label htmlFor="edit_cluster">Cluster</Label>
              <Input
                id="edit_cluster"
                value={formData.cluster}
                onChange={(e) => setFormData((prev) => ({ ...prev, cluster: e.target.value }))}
                placeholder="Enter cluster name"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Update Department</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete the department "{selectedDepartment?.department_code}"?</p>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Department
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
