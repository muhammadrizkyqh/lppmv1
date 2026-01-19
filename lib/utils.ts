import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get semantic badge variant based on status value
 * @param status - Status value (DITERIMA, DITOLAK, DIREVIEW, PENDING, etc.)
 * @returns Badge variant for semantic coloring
 */
export function getStatusBadgeVariant(status: string): "default" | "destructive" | "secondary" | "outline" {
  const upperStatus = status?.toUpperCase() || ''
  
  // Success states - green
  if (upperStatus.includes('DITERIMA') || upperStatus.includes('DISETUJUI') || upperStatus.includes('AKTIF')) {
    return 'default'
  }
  
  // Error/rejection states - red
  if (upperStatus.includes('DITOLAK') || upperStatus.includes('REJECT')) {
    return 'destructive'
  }
  
  // In-progress states - yellow/amber
  if (upperStatus.includes('DIREVIEW') || upperStatus.includes('REVIEW') || upperStatus.includes('PROSES')) {
    return 'secondary'
  }
  
  // Pending/waiting states - gray outline
  if (upperStatus.includes('PENDING') || upperStatus.includes('MENUNGGU') || upperStatus.includes('DRAFT')) {
    return 'outline'
  }
  
  // Default fallback
  return 'secondary'
}

