// API Client untuk semua endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Helper function untuk fetch dengan error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include', // Important untuk cookies
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Terjadi kesalahan',
      }
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan koneksi',
    }
  }
}

// ==========================================
// DOSEN API
// ==========================================

export interface Dosen {
  id: string
  userId: string
  nidn: string
  nama: string
  email: string
  noHp?: string
  bidangKeahlianId?: string
  status: string
  bidangKeahlian?: {
    id: string
    nama: string
  }
  user?: {
    id: string
    username: string
    email: string
    status: string
    lastLogin?: string
  }
}

export const dosenApi = {
  getAll: (params?: {
    search?: string
    status?: string
    bidangKeahlianId?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set('search', params.search)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.bidangKeahlianId) searchParams.set('bidangKeahlianId', params.bidangKeahlianId)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    return fetchApi<Dosen[]>(`/api/dosen?${searchParams}`)
  },

  getById: (id: string) => {
    return fetchApi<Dosen>(`/api/dosen/${id}`)
  },

  create: (data: {
    nidn: string
    nama: string
    email: string
    noHp?: string
    bidangKeahlianId?: string
    password?: string
    status?: string
  }) => {
    return fetchApi<Dosen>('/api/dosen', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: {
    nidn?: string
    nama?: string
    email?: string
    noHp?: string
    bidangKeahlianId?: string
    status?: string
  }) => {
    return fetchApi<Dosen>(`/api/dosen/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: string) => {
    return fetchApi(`/api/dosen/${id}`, {
      method: 'DELETE',
    })
  },
}

// ==========================================
// MAHASISWA API
// ==========================================

export interface Mahasiswa {
  id: string
  userId: string
  nim: string
  nama: string
  email: string
  prodi: string
  angkatan: string
  status: string
  user?: {
    id: string
    username: string
    email: string
    status: string
    lastLogin?: string
  }
}

export const mahasiswaApi = {
  getAll: (params?: {
    search?: string
    prodi?: string
    angkatan?: string
    status?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set('search', params.search)
    if (params?.prodi) searchParams.set('prodi', params.prodi)
    if (params?.angkatan) searchParams.set('angkatan', params.angkatan)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    return fetchApi<Mahasiswa[]>(`/api/mahasiswa?${searchParams}`)
  },

  getById: (id: string) => {
    return fetchApi<Mahasiswa>(`/api/mahasiswa/${id}`)
  },

  create: (data: {
    nim: string
    nama: string
    email: string
    prodi: string
    angkatan: string
    password?: string
    status?: string
  }) => {
    return fetchApi<Mahasiswa>('/api/mahasiswa', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: {
    nim?: string
    nama?: string
    email?: string
    prodi?: string
    angkatan?: string
    status?: string
  }) => {
    return fetchApi<Mahasiswa>(`/api/mahasiswa/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: string) => {
    return fetchApi(`/api/mahasiswa/${id}`, {
      method: 'DELETE',
    })
  },
}

// ==========================================
// REVIEWER API
// ==========================================

export interface Reviewer {
  id: string
  userId: string
  nama: string
  email: string
  institusi: string
  bidangKeahlianId?: string
  tipe: 'INTERNAL' | 'EKSTERNAL'
  status: string
  bidangKeahlian?: {
    id: string
    nama: string
  }
  user?: {
    id: string
    username: string
    email: string
    status: string
    lastLogin?: string
  }
  reviews?: Array<{
    id: string
    status: string
  }>
}

export const reviewerApi = {
  getAll: (params?: {
    search?: string
    tipe?: string
    bidangKeahlianId?: string
    status?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set('search', params.search)
    if (params?.tipe) searchParams.set('tipe', params.tipe)
    if (params?.bidangKeahlianId) searchParams.set('bidangKeahlianId', params.bidangKeahlianId)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    return fetchApi<Reviewer[]>(`/api/reviewer?${searchParams}`)
  },

  getById: (id: string) => {
    return fetchApi<Reviewer>(`/api/reviewer/${id}`)
  },

  create: (data: {
    nama: string
    email: string
    institusi: string
    bidangKeahlianId?: string
    tipe: 'INTERNAL' | 'EKSTERNAL'
    noHp?: string
    password?: string
    status?: string
  }) => {
    return fetchApi<Reviewer>('/api/reviewer', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: {
    nama?: string
    email?: string
    institusi?: string
    bidangKeahlianId?: string
    tipe?: 'INTERNAL' | 'EKSTERNAL'
    noHp?: string
    status?: string
  }) => {
    return fetchApi<Reviewer>(`/api/reviewer/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: string) => {
    return fetchApi(`/api/reviewer/${id}`, {
      method: 'DELETE',
    })
  },
}

// ==========================================
// BIDANG KEAHLIAN API
// ==========================================

export interface BidangKeahlian {
  id: string
  nama: string
  deskripsi?: string
  status: string
  _count?: {
    dosens: number
    reviewers: number
    proposals: number
  }
}

export const bidangKeahlianApi = {
  getAll: (params?: { status?: string }) => {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    const queryString = query.toString()
    return fetchApi<BidangKeahlian[]>(`/api/bidang-keahlian${queryString ? `?${queryString}` : ''}`)
  },

  getById: (id: string) => {
    return fetchApi<BidangKeahlian>(`/api/bidang-keahlian/${id}`)
  },

  create: (data: {
    nama: string
    deskripsi?: string
    status?: string
  }) => {
    return fetchApi<BidangKeahlian>('/api/bidang-keahlian', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: {
    nama?: string
    deskripsi?: string
    status?: string
  }) => {
    return fetchApi<BidangKeahlian>(`/api/bidang-keahlian/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: string) => {
    return fetchApi(`/api/bidang-keahlian/${id}`, {
      method: 'DELETE',
    })
  },
}

// ==========================================
// SKEMA API
// ==========================================

export interface Skema {
  id: string
  nama: string
  tipe: 'DASAR' | 'TERAPAN' | 'PENGEMBANGAN' | 'MANDIRI'
  dana: string
  deskripsi?: string
  status: string
  _count?: {
    proposals: number
  }
}

export const skemaApi = {
  getAll: (params?: { status?: string }) => {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    const queryString = query.toString()
    return fetchApi<Skema[]>(`/api/skema${queryString ? `?${queryString}` : ''}`)
  },

  getById: (id: string) => {
    return fetchApi<Skema>(`/api/skema/${id}`)
  },

  create: (data: {
    nama: string
    tipe: 'DASAR' | 'TERAPAN' | 'PENGEMBANGAN' | 'MANDIRI'
    dana: number
    deskripsi?: string
    status?: string
  }) => {
    return fetchApi<Skema>('/api/skema', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: {
    nama?: string
    tipe?: 'DASAR' | 'TERAPAN' | 'PENGEMBANGAN' | 'MANDIRI'
    dana?: number
    deskripsi?: string
    status?: string
  }) => {
    return fetchApi<Skema>(`/api/skema/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: string) => {
    return fetchApi(`/api/skema/${id}`, {
      method: 'DELETE',
    })
  },
}

// ==========================================
// PERIODE API
// ==========================================

export interface Periode {
  id: string
  tahun: string
  nama: string
  tanggalBuka: string
  tanggalTutup: string
  kuota: number
  status: 'AKTIF' | 'NONAKTIF' | 'SELESAI'
  _count?: {
    proposals: number
  }
}

export const periodeApi = {
  getAll: (params?: {
    status?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    const queryString = searchParams.toString()
    return fetchApi<Periode[]>(`/api/periode${queryString ? `?${queryString}` : ''}`)
  },

  getById: (id: string) => {
    return fetchApi<Periode>(`/api/periode/${id}`)
  },

  create: (data: {
    tahun: string
    nama: string
    tanggalBuka: string
    tanggalTutup: string
    kuota: number
    status?: 'AKTIF' | 'NONAKTIF' | 'SELESAI'
  }) => {
    return fetchApi<Periode>('/api/periode', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: {
    tahun?: string
    nama?: string
    tanggalBuka?: string
    tanggalTutup?: string
    kuota?: number
    status?: 'AKTIF' | 'NONAKTIF' | 'SELESAI'
  }) => {
    return fetchApi<Periode>(`/api/periode/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: string) => {
    return fetchApi(`/api/periode/${id}`, {
      method: 'DELETE',
    })
  },
}

// ==========================================
// AUTH API
// ==========================================

export interface SessionUser {
  id: string
  username: string
  email: string
  role: string
  name?: string
  nidn?: string
  nim?: string
}

export const authApi = {
  login: (data: {
    identifier: string
    password: string
  }) => {
    return fetchApi<{ user: SessionUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  logout: () => {
    return fetchApi('/api/auth/logout', {
      method: 'POST',
    })
  },

  getSession: () => {
    return fetchApi<{ user: SessionUser }>('/api/auth/session')
  },

  changePassword: (data: {
    oldPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    return fetchApi('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// ==========================================
// PROPOSAL INTERFACES
// ==========================================

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  DIAJUKAN = 'DIAJUKAN',
  DIREVIEW = 'DIREVIEW',
  REVISI = 'REVISI',
  DITERIMA = 'DITERIMA',
  DITOLAK = 'DITOLAK',
  BERJALAN = 'BERJALAN',
  SELESAI = 'SELESAI',
}

export interface Proposal {
  id: string
  periodeId: string
  skemaId: string
  ketuaId: string
  creatorId: string
  bidangKeahlianId: string | null
  judul: string
  abstrak: string
  filePath: string | null
  fileName: string | null
  fileSize: number | null
  status: ProposalStatus
  submittedAt: string | null
  approvedAt: string | null
  rejectedAt: string | null
  nilaiTotal: number | null
  revisiCount: number
  catatan: string | null
  createdAt: string
  updatedAt: string
  periode?: {
    id: string
    tahun: string
    nama: string
    status: string
  }
  skema?: {
    id: string
    nama: string
    tipe: string
    dana: number
  }
  ketua?: {
    id: string
    nidn: string
    nama: string
    email: string
  }
  bidangKeahlian?: {
    id: string
    nama: string
  } | null
  _count?: {
    members: number
    reviews: number
  }
}

export interface ProposalMember {
  id: string
  proposalId: string
  dosenId: string | null
  mahasiswaId: string | null
  role: string
  createdAt: string
  dosen?: {
    id: string
    nidn: string
    nama: string
    email: string
    bidangKeahlianId?: string
    bidangKeahlian?: {
      id: string
      nama: string
    }
  } | null
  mahasiswa?: {
    id: string
    nim: string
    nama: string
    email: string
    prodi: string
    angkatan: string
  } | null
}

export interface UploadResponse {
  fileName: string
  filePath: string
  fileSize: number
}

// ==========================================
// UPLOAD API
// ==========================================

export const uploadApi = {
  uploadFile: (file: File, periodeId?: string, proposalId?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (periodeId) formData.append('periodeId', periodeId)
    if (proposalId) formData.append('proposalId', proposalId)

    return fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then(async (response) => {
      const data = await response.json()
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Gagal mengupload file',
        }
      }
      return data
    }).catch((error) => {
      console.error('Upload error:', error)
      return {
        success: false,
        error: 'Terjadi kesalahan saat upload',
      }
    })
  },
}

// ==========================================
// PROPOSAL API
// ==========================================

export const proposalApi = {
  // Get all proposals
  getAll: (params?: {
    status?: string
    periodeId?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.periodeId) searchParams.set('periodeId', params.periodeId)
    const queryString = searchParams.toString()
    return fetchApi<Proposal[]>(`/api/proposal${queryString ? `?${queryString}` : ''}`)
  },

  // Get proposal by ID
  getById: (id: string) => {
    return fetchApi<Proposal>(`/api/proposal/${id}`)
  },

  // Create proposal
  create: (data: {
    periodeId: string
    skemaId: string
    bidangKeahlianId?: string
    judul: string
    abstrak: string
    filePath?: string
    fileName?: string
    fileSize?: number
  }) => {
    return fetchApi<Proposal>('/api/proposal', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update proposal
  update: (id: string, data: {
    periodeId?: string
    skemaId?: string
    bidangKeahlianId?: string
    judul?: string
    abstrak?: string
    filePath?: string
    fileName?: string
    fileSize?: number
  }) => {
    return fetchApi<Proposal>(`/api/proposal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete proposal
  delete: (id: string) => {
    return fetchApi(`/api/proposal/${id}`, {
      method: 'DELETE',
    })
  },

  // Submit proposal
  submit: (id: string) => {
    return fetchApi<Proposal>(`/api/proposal/${id}/submit`, {
      method: 'POST',
    })
  },

  // Get proposal members
  getMembers: (id: string) => {
    return fetchApi<ProposalMember[]>(`/api/proposal/${id}/members`)
  },

  // Add member to proposal
  addMember: (id: string, data: {
    dosenId?: string
    mahasiswaId?: string
    role?: string
  }) => {
    return fetchApi<ProposalMember>(`/api/proposal/${id}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Remove member from proposal
  removeMember: (proposalId: string, memberId: string) => {
    return fetchApi(`/api/proposal/${proposalId}/members/${memberId}`, {
      method: 'DELETE',
    })
  },

  // Assign reviewers to proposal (Admin only)
  assignReviewers: (proposalId: string, reviewerIds: string[]) => {
    return fetchApi(`/api/proposal/${proposalId}/assign-reviewers`, {
      method: 'POST',
      body: JSON.stringify({ reviewerIds }),
    })
  },
}


