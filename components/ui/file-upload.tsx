/**
 * FileUploadInput Component
 * Reusable file upload component with validation, progress tracking, and user-friendly messages
 */
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, FileText, X } from "lucide-react"
import { validateFileSize, validateFileType, formatFileSize, FILE_SIZE_LIMITS } from "@/lib/file-utils"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface FileUploadInputProps {
  id: string
  label: string
  accept?: string
  maxSize?: number
  allowedTypes?: string | string[]
  value: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
  required?: boolean
  showPreview?: boolean
  showSizeInfo?: boolean
  helperText?: string
}

export function FileUploadInput({
  id,
  label,
  accept = ".pdf",
  maxSize = FILE_SIZE_LIMITS.MAX_SIZE,
  allowedTypes = "application/pdf",
  value,
  onChange,
  disabled = false,
  required = false,
  showPreview = true,
  showSizeInfo = true,
  helperText,
}: FileUploadInputProps) {
  const [fileSize, setFileSize] = useState<string>("")
  const [validationError, setValidationError] = useState<string>("")
  const [validationWarning, setValidationWarning] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    // Reset states
    setValidationError("")
    setValidationWarning("")
    setFileSize("")
    
    if (!file) {
      onChange(null)
      return
    }

    // Validate file type
    const typeValidation = validateFileType(file, allowedTypes)
    if (!typeValidation.valid) {
      setValidationError(typeValidation.error!)
      toast.error(typeValidation.error!)
      e.target.value = ''
      onChange(null)
      return
    }

    // Validate file size
    const sizeValidation = validateFileSize(file, maxSize)
    if (!sizeValidation.valid) {
      setValidationError(sizeValidation.error!)
      toast.error(sizeValidation.error!)
      e.target.value = ''
      onChange(null)
      return
    }

    // Set warning if file is large
    if (sizeValidation.warning) {
      setValidationWarning(sizeValidation.warning)
      toast.warning(sizeValidation.warning)
    }

    setFileSize(sizeValidation.size)
    onChange(file)
  }

  const handleRemoveFile = () => {
    onChange(null)
    setFileSize("")
    setValidationError("")
    setValidationWarning("")
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {showSizeInfo && (
          <span className="text-xs text-muted-foreground">
            Maks. {formatFileSize(maxSize)}
          </span>
        )}
      </div>

      {showSizeInfo && (
        <Alert className="bg-blue-50 border-blue-200 py-2">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-800">
            {helperText || `Maksimal ukuran file: ${formatFileSize(maxSize)}. Jika file terlalu besar, kompres menggunakan tools online seperti iLovePDF.`}
          </AlertDescription>
        </Alert>
      )}

      <Input
        id={id}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        className={validationError ? "border-red-500" : ""}
      />

      {validationError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {validationError}
        </p>
      )}

      {validationWarning && !validationError && (
        <p className="text-sm text-orange-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {validationWarning}
        </p>
      )}

      {value && showPreview && !validationError && (
        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">{value.name}</p>
              <p className="text-xs text-green-600">{fileSize}</p>
            </div>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * FileUploadWithProgress Component
 * Upload with progress bar for large files
 */
interface FileUploadWithProgressProps extends FileUploadInputProps {
  uploadProgress?: number
  isUploading?: boolean
}

export function FileUploadWithProgress({
  uploadProgress = 0,
  isUploading = false,
  ...props
}: FileUploadWithProgressProps) {
  return (
    <div className="space-y-3">
      <FileUploadInput {...props} disabled={props.disabled || isUploading} />
      
      {isUploading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mengupload file...</span>
            <span className="font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  )
}
