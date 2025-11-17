/**
 * Validation helpers for proposal module
 */

import { Periode, Proposal } from "@/lib/api-client";

/**
 * Check if periode is currently open for submission
 */
export function isPeriodeOpen(periode: Periode | null | undefined): {
  isOpen: boolean;
  message?: string;
} {
  if (!periode) {
    return { isOpen: false, message: "Periode tidak ditemukan" };
  }

  if (periode.status !== "AKTIF") {
    return { isOpen: false, message: "Periode sudah tidak aktif" };
  }

  const now = new Date();
  const tglBuka = new Date(periode.tanggalBuka);
  const tglTutup = new Date(periode.tanggalTutup);

  if (now < tglBuka) {
    return {
      isOpen: false,
      message: `Periode belum dibuka. Periode dibuka pada ${tglBuka.toLocaleDateString(
        "id-ID",
        { day: "numeric", month: "long", year: "numeric" }
      )}`,
    };
  }

  if (now > tglTutup) {
    return {
      isOpen: false,
      message: `Periode sudah ditutup pada ${tglTutup.toLocaleDateString(
        "id-ID",
        { day: "numeric", month: "long", year: "numeric" }
      )}`,
    };
  }

  return { isOpen: true };
}

/**
 * Get remaining days for periode
 */
export function getRemainingDays(periode: Periode | null | undefined): number {
  if (!periode) return 0;

  const now = new Date();
  const tglTutup = new Date(periode.tanggalTutup);
  const diffTime = tglTutup.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Validate proposal before submit
 */
export function validateProposalSubmit(proposal: {
  judul?: string;
  abstrak?: string;
  filePath?: string | null;
  periode?: Periode | null;
}): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!proposal.judul?.trim()) {
    errors.push("Judul penelitian harus diisi");
  }

  if (!proposal.abstrak?.trim()) {
    errors.push("Abstrak harus diisi");
  }

  if (!proposal.filePath) {
    errors.push("File proposal harus diupload");
  }

  // Check field length
  if (proposal.judul && proposal.judul.length > 500) {
    errors.push("Judul maksimal 500 karakter");
  }

  if (proposal.abstrak && proposal.abstrak.length > 500) {
    errors.push("Abstrak maksimal 500 karakter");
  }

  // Check periode
  if (proposal.periode) {
    const periodeCheck = isPeriodeOpen(proposal.periode);
    if (!periodeCheck.isOpen && periodeCheck.message) {
      errors.push(periodeCheck.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if proposal can be edited
 */
export function canEditProposal(proposal: {
  status: string;
  creatorId?: string;
  currentUserId?: string;
}): {
  canEdit: boolean;
  message?: string;
} {
  // Only DRAFT can be edited
  if (proposal.status !== "DRAFT") {
    return {
      canEdit: false,
      message: "Hanya proposal dengan status DRAFT yang dapat diedit",
    };
  }

  // Check ownership (if userId provided)
  if (proposal.creatorId && proposal.currentUserId) {
    if (proposal.creatorId !== proposal.currentUserId) {
      return {
        canEdit: false,
        message: "Anda tidak memiliki akses untuk mengedit proposal ini",
      };
    }
  }

  return { canEdit: true };
}

/**
 * Check if proposal can be deleted
 */
export function canDeleteProposal(proposal: {
  status: string;
  creatorId?: string;
  currentUserId?: string;
}): {
  canDelete: boolean;
  message?: string;
} {
  // Only DRAFT can be deleted
  if (proposal.status !== "DRAFT") {
    return {
      canDelete: false,
      message: "Hanya proposal dengan status DRAFT yang dapat dihapus",
    };
  }

  // Check ownership (if userId provided)
  if (proposal.creatorId && proposal.currentUserId) {
    if (proposal.creatorId !== proposal.currentUserId) {
      return {
        canDelete: false,
        message: "Anda tidak memiliki akses untuk menghapus proposal ini",
      };
    }
  }

  return { canDelete: true };
}

/**
 * Check if can add team member
 */
export function canAddMember(proposal: {
  status: string;
  memberCount: number;
}): {
  canAdd: boolean;
  message?: string;
} {
  // Only DRAFT can add members
  if (proposal.status !== "DRAFT") {
    return {
      canAdd: false,
      message: "Hanya proposal DRAFT yang dapat menambah anggota",
    };
  }

  // Check max members (4)
  if (proposal.memberCount >= 4) {
    return {
      canAdd: false,
      message: "Maksimal 4 anggota tim (termasuk ketua)",
    };
  }

  return { canAdd: true };
}

/**
 * Get status transition rules
 */
export function getStatusTransitions(currentStatus: string): string[] {
  const transitions: Record<string, string[]> = {
    DRAFT: ["DIAJUKAN"], // Can submit
    DIAJUKAN: ["DIREVIEW", "DRAFT"], // Admin can move to review or back to draft
    DIREVIEW: ["REVISI", "DITERIMA", "DITOLAK"], // Reviewer decision
    REVISI: ["DIAJUKAN"], // Dosen re-submit after revision
    DITERIMA: ["BERJALAN"], // Admin start project
    DITOLAK: [], // Final state
    BERJALAN: ["SELESAI"], // Complete project
    SELESAI: [], // Final state
  };

  return transitions[currentStatus] || [];
}

/**
 * Check if status transition is allowed
 */
export function canTransitionStatus(
  from: string,
  to: string
): {
  allowed: boolean;
  message?: string;
} {
  const allowedTransitions = getStatusTransitions(from);

  if (!allowedTransitions.includes(to)) {
    return {
      allowed: false,
      message: `Tidak dapat mengubah status dari ${from} ke ${to}`,
    };
  }

  return { allowed: true };
}

/**
 * Format periode date range
 */
export function formatPeriodeDateRange(periode: Periode): string {
  const tglBuka = new Date(periode.tanggalBuka).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const tglTutup = new Date(periode.tanggalTutup).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${tglBuka} - ${tglTutup}`;
}

/**
 * Get periode status badge info
 */
export function getPeriodeStatusBadge(periode: Periode): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className?: string;
} {
  const periodeCheck = isPeriodeOpen(periode);

  if (periodeCheck.isOpen) {
    const remainingDays = getRemainingDays(periode);

    if (remainingDays <= 3) {
      return {
        label: `Ditutup dalam ${remainingDays} hari`,
        variant: "destructive",
      };
    }

    return {
      label: "Aktif",
      variant: "default",
      className: "bg-green-500",
    };
  }

  if (periode.status !== "AKTIF") {
    return {
      label: "Tidak Aktif",
      variant: "secondary",
    };
  }

  const now = new Date();
  const tglBuka = new Date(periode.tanggalBuka);

  if (now < tglBuka) {
    return {
      label: "Belum Dibuka",
      variant: "outline",
    };
  }

  return {
    label: "Ditutup",
    variant: "destructive",
  };
}
