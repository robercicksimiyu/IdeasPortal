// Cloudinary configuration for client-side
const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
}

export { cloudinaryConfig }

// Helper function to get file type from mime type
export function getFileTypeFromMime(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType.startsWith("video/")) return "video"
  if (mimeType.includes("pdf")) return "pdf"
  if (mimeType.includes("word") || mimeType.includes("document")) return "document"
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "spreadsheet"
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "presentation"
  return "other"
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Helper function to get file icon based on type
export function getFileIcon(fileType: string): string {
  switch (fileType) {
    case "image":
      return "🖼️"
    case "video":
      return "🎥"
    case "pdf":
      return "📄"
    case "document":
      return "📝"
    case "spreadsheet":
      return "📊"
    case "presentation":
      return "📋"
    default:
      return "📎"
  }
}
