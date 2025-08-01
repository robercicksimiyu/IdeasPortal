"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, Upload, File, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getFileTypeFromMime } from "@/lib/cloudinary"

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Helper function to get file icon
const getFileIcon = (fileType: string) => {
  const FileIcon = File
  return <FileIcon className="h-6 w-6" />
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  existingFiles?: UploadedFile[]
}

export interface UploadedFile {
  id?: number
  file_name: string
  file_type: string
  file_size: number
  cloudinary_public_id: string
  cloudinary_url: string
  cloudinary_secure_url: string
  uploaded_at?: string
}

export function FileUpload({
  onFilesUploaded,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ["image/*", "application/pdf", ".doc,.docx", ".xls,.xlsx", ".ppt,.pptx", ".txt", ".csv"],
  existingFiles = [],
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(existingFiles)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
        toast({
          title: "Too many files",
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive",
        })
        return
      }

      setUploading(true)
      setUploadProgress(0)

      try {
        const newFiles: UploadedFile[] = []

        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i]

          if (file.size > maxSize) {
            toast({
              title: "File too large",
              description: `${file.name} exceeds ${formatFileSize(maxSize)} limit`,
              variant: "destructive",
            })
            continue
          }

          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`)
          }

          const result = await response.json()

          const uploadedFile: UploadedFile = {
            file_name: file.name,
            file_type: getFileTypeFromMime(file.type),
            file_size: file.size,
            cloudinary_public_id: result.public_id,
            cloudinary_url: result.url,
            cloudinary_secure_url: result.secure_url,
          }

          newFiles.push(uploadedFile)
          setUploadProgress(((i + 1) / acceptedFiles.length) * 100)
        }

        const allFiles = [...uploadedFiles, ...newFiles]
        setUploadedFiles(allFiles)
        onFilesUploaded(allFiles)

        toast({
          title: "Upload successful",
          description: `${newFiles.length} file(s) uploaded successfully`,
        })
      } catch (error) {
        console.error("Upload error:", error)
        toast({
          title: "Upload failed",
          description: "Failed to upload files. Please try again.",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [uploadedFiles, maxFiles, maxSize, onFilesUploaded, toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: maxFiles - uploadedFiles.length,
    disabled: uploading || uploadedFiles.length >= maxFiles,
  })

  const removeFile = async (index: number) => {
    const fileToRemove = uploadedFiles[index]

    try {
      // Delete from Cloudinary
      await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ public_id: fileToRemove.cloudinary_public_id }),
      })

      const newFiles = uploadedFiles.filter((_, i) => i !== index)
      setUploadedFiles(newFiles)
      onFilesUploaded(newFiles)

      toast({
        title: "File removed",
        description: `${fileToRemove.file_name} has been removed`,
      })
    } catch (error) {
      console.error("Error removing file:", error)
      toast({
        title: "Error",
        description: "Failed to remove file",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {uploadedFiles.length < maxFiles && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              } ${uploading ? "pointer-events-none opacity-50" : ""}`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              {isDragActive ? (
                <p className="text-lg font-medium">Drop files here...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">Drag & drop files here, or click to select</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Maximum {maxFiles} files, up to {formatFileSize(maxSize)} each
                  </p>
                  <Button type="button" variant="outline" disabled={uploading}>
                    {uploading ? "Uploading..." : "Choose Files"}
                  </Button>
                </div>
              )}
            </div>

            {uploading && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Uploading... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Attached Files ({uploadedFiles.length})</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getFileIcon(file.file_type)}</div>
                    <div>
                      <p className="font-medium text-sm">{file.file_name}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {file.file_type}
                        </Badge>
                        <span>{formatFileSize(file.file_size)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => window.open(file.cloudinary_secure_url, "_blank")}>
                      <File className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Type Info */}
      <div className="text-xs text-muted-foreground">
        <div className="flex items-center gap-1 mb-1">
          <AlertCircle className="h-3 w-3" />
          <span>Supported formats:</span>
        </div>
        <p>Images (JPG, PNG, GIF), Documents (PDF, DOC, XLS, PPT), Text files (TXT, CSV)</p>
      </div>
    </div>
  )
}
