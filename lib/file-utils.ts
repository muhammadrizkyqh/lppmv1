/**
 * File utilities for handling file uploads, validation, and compression
 */

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  // Maximum file size allowed (10MB default, can be up to 50MB with server config)
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  // Warn user if file is larger than this (5MB)
  WARN_SIZE: 5 * 1024 * 1024, // 5MB
  // Recommended size (2MB)
  RECOMMENDED_SIZE: 2 * 1024 * 1024, // 2MB
}

export const ALLOWED_FILE_TYPES = {
  PDF: 'application/pdf',
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSize: number = FILE_SIZE_LIMITS.MAX_SIZE): {
  valid: boolean
  error?: string
  warning?: string
  size: string
} {
  const size = formatFileSize(file.size)
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File terlalu besar (${size}). Maksimal ${formatFileSize(maxSize)}`,
      size,
    }
  }
  
  if (file.size > FILE_SIZE_LIMITS.WARN_SIZE) {
    return {
      valid: true,
      warning: `File cukup besar (${size}). Disarankan maksimal ${formatFileSize(FILE_SIZE_LIMITS.RECOMMENDED_SIZE)} untuk upload lebih cepat`,
      size,
    }
  }
  
  return {
    valid: true,
    size,
  }
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string | string[]): {
  valid: boolean
  error?: string
} {
  const types = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes]
  
  if (!types.includes(file.type)) {
    const allowedExtensions = types.map(type => {
      if (type === 'application/pdf') return 'PDF'
      if (type.startsWith('image/')) return type.split('/')[1].toUpperCase()
      return type
    }).join(', ')
    
    return {
      valid: false,
      error: `Tipe file tidak didukung. Hanya menerima: ${allowedExtensions}`,
    }
  }
  
  return { valid: true }
}

/**
 * Compress PDF file (client-side compression)
 * Note: True PDF compression is complex. This function attempts basic compression
 * by reducing the file if it's an image-based PDF or provides guidance.
 */
export async function compressPDFIfNeeded(file: File): Promise<{
  file: File
  compressed: boolean
  originalSize: number
  newSize: number
  message?: string
}> {
  const originalSize = file.size
  
  // If file is already small enough, return as is
  if (file.size <= FILE_SIZE_LIMITS.RECOMMENDED_SIZE) {
    return {
      file,
      compressed: false,
      originalSize,
      newSize: originalSize,
    }
  }
  
  // For PDF files, we can't do true compression without a heavy library
  // Instead, we'll try to detect if it can be compressed and provide guidance
  try {
    // Check if file is actually compressible (has images, etc)
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const text = new TextDecoder().decode(uint8Array.slice(0, 1000))
    
    // Check if PDF contains images (basic detection)
    const hasImages = text.includes('/Image') || text.includes('/DCTDecode') || text.includes('/FlateDecode')
    
    if (hasImages && file.size > FILE_SIZE_LIMITS.WARN_SIZE) {
      // File likely has images and can benefit from compression
      return {
        file,
        compressed: false,
        originalSize,
        newSize: originalSize,
        message: 'PDF ini sepertinya mengandung gambar. Disarankan kompres menggunakan tools online seperti iLovePDF atau Smallpdf untuk mengurangi ukuran file.',
      }
    }
    
    // If file is text-heavy or already optimized
    return {
      file,
      compressed: false,
      originalSize,
      newSize: originalSize,
      message: file.size > FILE_SIZE_LIMITS.MAX_SIZE 
        ? 'File terlalu besar untuk diupload. Silakan kompres terlebih dahulu.'
        : undefined,
    }
  } catch (error) {
    console.error('Error analyzing PDF:', error)
    return {
      file,
      compressed: false,
      originalSize,
      newSize: originalSize,
    }
  }
}

/**
 * Check if file needs compression based on size
 */
export function shouldCompressFile(fileSize: number): boolean {
  return fileSize > FILE_SIZE_LIMITS.WARN_SIZE
}

/**
 * Create a validated file input handler (all-in-one)
 * Returns a ready-to-use onChange handler for file inputs
 */
export function createValidatedFileHandler(
  onSuccess: (file: File) => void,
  options: {
    allowedTypes?: string | string[]
    maxSize?: number
    showToasts?: boolean
  } = {}
) {
  const {
    allowedTypes = 'application/pdf',
    maxSize = FILE_SIZE_LIMITS.MAX_SIZE,
    showToasts = true,
  } = options

  return async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const typeValidation = validateFileType(file, allowedTypes)
    if (!typeValidation.valid) {
      if (showToasts) {
        const { toast } = await import('sonner')
        toast.error(typeValidation.error!)
      }
      e.target.value = ''
      return
    }

    // Validate file size
    const sizeValidation = validateFileSize(file, maxSize)
    if (!sizeValidation.valid) {
      if (showToasts) {
        const { toast } = await import('sonner')
        toast.error(sizeValidation.error!)
      }
      e.target.value = ''
      return
    }

    // Show recommendations
    if (showToasts) {
      const { toast } = await import('sonner')
      
      const recommendation = getCompressionRecommendation(file.size)
      if (recommendation) {
        toast.warning(recommendation, { duration: 5000 })
      }

      // Analyze PDF for compression guidance
      const compressionResult = await compressPDFIfNeeded(file)
      if (compressionResult.message) {
        toast.info(compressionResult.message, { duration: 6000 })
      }

      onSuccess(compressionResult.file)
    } else {
      onSuccess(file)
    }
  }
}

/**
 * Get compression recommendation message
 */
export function getCompressionRecommendation(fileSize: number): string | null {
  if (fileSize > FILE_SIZE_LIMITS.MAX_SIZE) {
    return `File terlalu besar (${formatFileSize(fileSize)}). Wajib kompres terlebih dahulu. Maksimal ${formatFileSize(FILE_SIZE_LIMITS.MAX_SIZE)}.`
  }
  
  if (fileSize > FILE_SIZE_LIMITS.WARN_SIZE) {
    return `File cukup besar (${formatFileSize(fileSize)}). Disarankan kompres untuk upload lebih cepat. Rekomendasi: < ${formatFileSize(FILE_SIZE_LIMITS.RECOMMENDED_SIZE)}.`
  }
  
  return null
}

/**
 * Create a file input change handler with validation
 */
export function createFileInputHandler(
  onFileSelect: (file: File) => void,
  options: {
    allowedTypes?: string | string[]
    maxSize?: number
    onError?: (error: string) => void
    onWarning?: (warning: string) => void
  } = {}
) {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (!file) return
    
    // Validate file type
    if (options.allowedTypes) {
      const typeValidation = validateFileType(file, options.allowedTypes)
      if (!typeValidation.valid) {
        options.onError?.(typeValidation.error!)
        event.target.value = '' // Reset input
        return
      }
    }
    
    // Validate file size
    const sizeValidation = validateFileSize(file, options.maxSize)
    if (!sizeValidation.valid) {
      options.onError?.(sizeValidation.error!)
      event.target.value = '' // Reset input
      return
    }
    
    // Show warning if file is large
    if (sizeValidation.warning) {
      options.onWarning?.(sizeValidation.warning)
    }
    
    onFileSelect(file)
  }
}

/**
 * Upload file with progress tracking
 */
export async function uploadFileWithProgress(
  url: string,
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          onProgress(Math.round(percentComplete))
        }
      })
    }
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Create a Response object from XHR
        const response = new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
        })
        resolve(response)
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })
    
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'))
    })
    
    xhr.open('POST', url)
    xhr.send(formData)
  })
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove special characters and spaces
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}
