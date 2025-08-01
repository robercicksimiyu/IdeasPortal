"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, Download, ExternalLink, FileText, ImageIcon, Video, File } from "lucide-react"
import { formatFileSize, getFileIcon } from "@/lib/cloudinary"
import type { UploadedFile } from "@/components/file-upload"

interface FileViewerProps {
  files: UploadedFile[]
  title?: string
  showTitle?: boolean
}

export function FileViewer({ files, title = "Attachments", showTitle = true }: FileViewerProps) {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)

  if (!files || files.length === 0) {
    return null
  }

  const getFilePreview = (file: UploadedFile) => {
    switch (file.file_type) {
      case "image":
        return (
          <div className="w-full h-64 bg-muted rounded-lg overflow-hidden">
            <img
              src={file.cloudinary_secure_url || "/placeholder.svg"}
              alt={file.file_name}
              className="w-full h-full object-contain"
            />
          </div>
        )
      case "video":
        return (
          <div className="w-full h-64 bg-muted rounded-lg overflow-hidden">
            <video src={file.cloudinary_secure_url} controls className="w-full h-full object-contain">
              Your browser does not support the video tag.
            </video>
          </div>
        )
      case "pdf":
        return (
          <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">PDF Document</p>
              <p className="text-xs text-muted-foreground mt-1">{file.file_name}</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{file.file_type.toUpperCase()} File</p>
              <p className="text-xs text-muted-foreground mt-1">{file.file_name}</p>
            </div>
          </div>
        )
    }
  }

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title} ({files.length})
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "" : "p-4"}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getFileTypeIcon(file.file_type)}
                    <Badge variant="outline" className="text-xs">
                      {file.file_type}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedFile(file)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <span className="text-2xl">{getFileIcon(file.file_type)}</span>
                            {file.file_name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {getFilePreview(file)}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Size: {formatFileSize(file.file_size)}</span>
                              <span>Type: {file.file_type}</span>
                              {file.uploaded_at && (
                                <span>Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}</span>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(file.cloudinary_secure_url, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement("a")
                                  link.href = file.cloudinary_secure_url
                                  link.download = file.file_name
                                  link.click()
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement("a")
                        link.href = file.cloudinary_secure_url
                        link.download = file.file_name
                        link.click()
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* File thumbnail/preview */}
                <div className="mb-3">
                  {file.file_type === "image" ? (
                    <div className="w-full h-32 bg-muted rounded overflow-hidden">
                      <img
                        src={file.cloudinary_secure_url || "/placeholder.svg"}
                        alt={file.file_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                      <span className="text-4xl">{getFileIcon(file.file_type)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-medium text-sm truncate" title={file.file_name}>
                    {file.file_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{formatFileSize(file.file_size)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
