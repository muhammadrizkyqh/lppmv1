"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Plus,
  Users,
  GraduationCap,
  Download,
  Upload,
  Edit,
  Trash2,
  Mail,
  Phone,
  BookOpen,
  UserCheck,
  Loader2,
  RefreshCw,
  CheckSquare,
  Square
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import { useState } from "react";
import { useDosen, useMahasiswa, useReviewer, useBidangKeahlian } from "@/hooks/use-data";
import { DosenFormDialog } from "@/components/data-master/dosen-form-dialog";
import { MahasiswaFormDialog } from "@/components/data-master/mahasiswa-form-dialog";
import { ReviewerFormDialog } from "@/components/data-master/reviewer-form-dialog";
import { DeleteConfirmDialog } from "@/components/data-master/delete-confirm-dialog";
import { dosenApi, mahasiswaApi, reviewerApi } from "@/lib/api-client";
import type { Dosen, Mahasiswa, Reviewer } from "@/lib/api-client";

export default function DataMasterPage() {
  const [activeTab, setActiveTab] = useState("dosen");
  
  // Search states
  const [dosenSearch, setDosenSearch] = useState("");
  const [mahasiswaSearch, setMahasiswaSearch] = useState("");
  const [reviewerSearch, setReviewerSearch] = useState("");

  // Pagination states
  const [dosenPage, setDosenPage] = useState(1);
  const [dosenPageSize, setDosenPageSize] = useState(10);
  const [mahasiswaPage, setMahasiswaPage] = useState(1);
  const [mahasiswaPageSize, setMahasiswaPageSize] = useState(10);
  const [reviewerPage, setReviewerPage] = useState(1);
  const [reviewerPageSize, setReviewerPageSize] = useState(10);

  // Selection states for bulk delete
  const [selectedDosenIds, setSelectedDosenIds] = useState<string[]>([]);
  const [selectedMahasiswaIds, setSelectedMahasiswaIds] = useState<string[]>([]);
  const [selectedReviewerIds, setSelectedReviewerIds] = useState<string[]>([]);

  // Dialog states
  const [dosenDialogOpen, setDosenDialogOpen] = useState(false);
  const [mahasiswaDialogOpen, setMahasiswaDialogOpen] = useState(false);
  const [reviewerDialogOpen, setReviewerDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedDosen, setSelectedDosen] = useState<Dosen | null>(null);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<Reviewer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);

  // Fetch data dengan hooks
  const { data: dosenData, loading: dosenLoading, error: dosenError, refetch: refetchDosen } = useDosen({ search: dosenSearch, limit: 1000 });
  const { data: mahasiswaData, loading: mahasiswaLoading, error: mahasiswaError, refetch: refetchMahasiswa } = useMahasiswa({ search: mahasiswaSearch, limit: 1000 });
  const { data: reviewerData, loading: reviewerLoading, error: reviewerError, refetch: refetchReviewer } = useReviewer({ search: reviewerSearch, limit: 1000 });
  const { data: bidangKeahlianData } = useBidangKeahlian();

  // Handle actions
  const handleEditDosen = (dosen: Dosen) => {
    setSelectedDosen(dosen);
    setDosenDialogOpen(true);
  };

  const handleDeleteDosen = (dosen: Dosen) => {
    setDeleteTarget({ type: 'dosen', id: dosen.id, name: dosen.nama });
    setDeleteDialogOpen(true);
  };

  const handleEditMahasiswa = (mahasiswa: Mahasiswa) => {
    setSelectedMahasiswa(mahasiswa);
    setMahasiswaDialogOpen(true);
  };

  const handleDeleteMahasiswa = (mahasiswa: Mahasiswa) => {
    setDeleteTarget({ type: 'mahasiswa', id: mahasiswa.id, name: mahasiswa.nama });
    setDeleteDialogOpen(true);
  };

  const handleEditReviewer = (reviewer: Reviewer) => {
    setSelectedReviewer(reviewer);
    setReviewerDialogOpen(true);
  };

  const handleDeleteReviewer = (reviewer: Reviewer) => {
    setDeleteTarget({ type: 'reviewer', id: reviewer.id, name: reviewer.nama });
    setDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    if (activeTab === 'dosen') {
      setSelectedDosen(null);
      setDosenDialogOpen(true);
    } else if (activeTab === 'mahasiswa') {
      setSelectedMahasiswa(null);
      setMahasiswaDialogOpen(true);
    } else if (activeTab === 'reviewer') {
      setSelectedReviewer(null);
      setReviewerDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'dosen') {
        const result = await dosenApi.delete(deleteTarget.id);
        if (result.success) {
          toast.success('Dosen berhasil dihapus');
          refetchDosen();
        } else {
          toast.error(result.error || 'Gagal menghapus dosen');
        }
      } else if (deleteTarget.type === 'mahasiswa') {
        const result = await mahasiswaApi.delete(deleteTarget.id);
        if (result.success) {
          toast.success('Mahasiswa berhasil dihapus');
          refetchMahasiswa();
        } else {
          toast.error(result.error || 'Gagal menghapus mahasiswa');
        }
      } else if (deleteTarget.type === 'reviewer') {
        const result = await reviewerApi.delete(deleteTarget.id);
        if (result.success) {
          toast.success('Reviewer berhasil dihapus');
          refetchReviewer();
        } else {
          toast.error(result.error || 'Gagal menghapus reviewer');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    }
  };

  // Bulk delete handlers
  const handleBulkDelete = async () => {
    try {
      let result: any;
      if (activeTab === 'dosen' && selectedDosenIds.length > 0) {
        const response = await fetch('/api/admin/dosen/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedDosenIds }),
        });
        result = await response.json();
        if (result.success) {
          toast.success(`${selectedDosenIds.length} dosen berhasil dihapus`);
          setSelectedDosenIds([]);
          refetchDosen();
        } else {
          toast.error(result.error || 'Gagal menghapus dosen');
        }
      } else if (activeTab === 'mahasiswa' && selectedMahasiswaIds.length > 0) {
        const response = await fetch('/api/admin/mahasiswa/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedMahasiswaIds }),
        });
        result = await response.json();
        if (result.success) {
          toast.success(`${selectedMahasiswaIds.length} mahasiswa berhasil dihapus`);
          setSelectedMahasiswaIds([]);
          refetchMahasiswa();
        } else {
          toast.error(result.error || 'Gagal menghapus mahasiswa');
        }
      } else if (activeTab === 'reviewer' && selectedReviewerIds.length > 0) {
        const response = await fetch('/api/admin/reviewer/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedReviewerIds }),
        });
        result = await response.json();
        if (result.success) {
          toast.success(`${selectedReviewerIds.length} reviewer berhasil dihapus`);
          setSelectedReviewerIds([]);
          refetchReviewer();
        } else {
          toast.error(result.error || 'Gagal menghapus reviewer');
        }
      }
      setBulkDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    }
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (activeTab === 'dosen') {
      setSelectedDosenIds(checked ? (dosenData || []).map(d => d.id) : []);
    } else if (activeTab === 'mahasiswa') {
      setSelectedMahasiswaIds(checked ? (mahasiswaData || []).map(m => m.id) : []);
    } else if (activeTab === 'reviewer') {
      setSelectedReviewerIds(checked ? (reviewerData || []).map(r => r.id) : []);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (activeTab === 'dosen') {
      setSelectedDosenIds(prev => 
        checked ? [...prev, id] : prev.filter(x => x !== id)
      );
    } else if (activeTab === 'mahasiswa') {
      setSelectedMahasiswaIds(prev => 
        checked ? [...prev, id] : prev.filter(x => x !== id)
      );
    } else if (activeTab === 'reviewer') {
      setSelectedReviewerIds(prev => 
        checked ? [...prev, id] : prev.filter(x => x !== id)
      );
    }
  };

  const isItemSelected = (id: string) => {
    if (activeTab === 'dosen') return selectedDosenIds.includes(id);
    if (activeTab === 'mahasiswa') return selectedMahasiswaIds.includes(id);
    if (activeTab === 'reviewer') return selectedReviewerIds.includes(id);
    return false;
  };

  const isAllSelected = () => {
    if (activeTab === 'dosen') {
      return dosenData && dosenData.length > 0 && selectedDosenIds.length === dosenData.length;
    }
    if (activeTab === 'mahasiswa') {
      return mahasiswaData && mahasiswaData.length > 0 && selectedMahasiswaIds.length === mahasiswaData.length;
    }
    if (activeTab === 'reviewer') {
      return reviewerData && reviewerData.length > 0 && selectedReviewerIds.length === reviewerData.length;
    }
    return false;
  };

  const getSelectedCount = () => {
    if (activeTab === 'dosen') return selectedDosenIds.length;
    if (activeTab === 'mahasiswa') return selectedMahasiswaIds.length;
    if (activeTab === 'reviewer') return selectedReviewerIds.length;
    return 0;
  };

  // Column definitions untuk Dosen
  const dosenColumns: any[] = [
    {
      key: "select",
      header: () => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleSelectAll(!isAllSelected())}
            className="hover:bg-muted rounded p-1"
          >
            {isAllSelected() ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
      render: (_: any, row: any) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleSelectItem(row.id, !isItemSelected(row.id))}
            className="hover:bg-muted rounded p-1"
          >
            {isItemSelected(row.id) ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: "nama",
      header: "Dosen",
      render: (_: any, row: any) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-green-100 text-green-700">
              {row.nama.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.nama}</p>
            <p className="text-sm text-muted-foreground">NIDN: {row.nidn}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Kontak",
      render: (_: any, row: any) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
            {row.email}
          </div>
          {row.noHp && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="w-4 h-4 mr-2" />
              {row.noHp}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "bidangKeahlianId",
      header: "Bidang Keahlian",
      render: (_: any, row: any) => (
        <div className="flex items-center">
          <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
          {row.bidangkeahlian?.nama || '-'}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_: any, row: any) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      key: "id",
      header: "Aksi",
      render: (_: any, row: any) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={() => handleEditDosen(row)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteDosen(row)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Column definitions untuk Mahasiswa
  const mahasiswaColumns: any[] = [
    {
      key: "select",
      header: () => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleSelectAll(!isAllSelected())}
            className="hover:bg-muted rounded p-1"
          >
            {isAllSelected() ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
      render: (_: any, row: any) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleSelectItem(row.id, !isItemSelected(row.id))}
            className="hover:bg-muted rounded p-1"
          >
            {isItemSelected(row.id) ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: "nama",
      header: "Mahasiswa",
      render: (_: any, row: any) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {row.nama.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.nama}</p>
            <p className="text-sm text-muted-foreground">NIM: {row.nim}</p>
          </div>
        </div>
      ),
    },
    {
      key: "prodi",
      header: "Program Studi",
      render: (_: any, row: any) => (
        <div>
          <p className="font-medium">{row.prodi}</p>
          <p className="text-sm text-muted-foreground">Angkatan {row.angkatan}</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (_: any, row: any) => (
        <div className="flex items-center text-sm">
          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
          {row.email}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_: any, row: any) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      key: "id",
      header: "Aksi",
      render: (_: any, row: any) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={() => handleEditMahasiswa(row)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteMahasiswa(row)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Column definitions untuk Reviewer
  const reviewerColumns: any[] = [
    {
      key: "select",
      header: () => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleSelectAll(!isAllSelected())}
            className="hover:bg-muted rounded p-1"
          >
            {isAllSelected() ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
      render: (_: any, row: any) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleSelectItem(row.id, !isItemSelected(row.id))}
            className="hover:bg-muted rounded p-1"
          >
            {isItemSelected(row.id) ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: "nama",
      header: "Reviewer",
      render: (_: any, row: any) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-purple-100 text-purple-700">
              {row.nama.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.nama}</p>
            <p className="text-sm text-muted-foreground">{row.institusi}</p>
          </div>
        </div>
      ),
    },
    {
      key: "tipe",
      header: "Tipe",
      render: (_: any, row: any) => (
        <Badge variant={row.tipe === 'INTERNAL' ? 'default' : 'secondary'}>
          {row.tipe}
        </Badge>
      ),
    },
    {
      key: "bidangKeahlianId",
      header: "Bidang Keahlian",
      render: (_: any, row: any) => (
        <div className="flex items-center">
          <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
          {row.bidangkeahlian?.nama || '-'}
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (_: any, row: any) => (
        <div className="flex items-center text-sm">
          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
          {row.email}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_: any, row: any) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      key: "id",
      header: "Aksi",
      render: (_: any, row: any) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={() => handleEditReviewer(row)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteReviewer(row)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Handle refresh
  const handleRefresh = () => {
    if (activeTab === 'dosen') refetchDosen();
    else if (activeTab === 'mahasiswa') refetchMahasiswa();
    else if (activeTab === 'reviewer') refetchReviewer();
    
    toast.success('Data berhasil di-refresh');
  };

  // Handle export
  const handleExport = () => {
    try {
      let data: any[] = [];
      let filename = '';
      let headers: string[] = [];

      if (activeTab === 'dosen') {
        data = dosenData || [];
        filename = 'data-dosen.csv';
        headers = ['NIDN', 'Nama', 'Email', 'NoHP', 'BidangKeahlian', 'Status'];
        
        const csvContent = [
          headers.join(','),
          ...data.map((d: any) => [
            d.nidn,
            `"${d.nama}"`,
            d.email,
            d.noHp || '',
            `"${d.bidangkeahlian?.nama || ''}"`,
            d.status
          ].join(','))
        ].join('\n');

        downloadCSV(csvContent, filename);
      } else if (activeTab === 'mahasiswa') {
        data = mahasiswaData || [];
        filename = 'data-mahasiswa.csv';
        headers = ['NIM', 'Nama', 'Email', 'Prodi', 'Angkatan', 'Status'];
        
        const csvContent = [
          headers.join(','),
          ...data.map((m: any) => [
            m.nim,
            `"${m.nama}"`,
            m.email,
            `"${m.prodi}"`,
            m.angkatan,
            m.status
          ].join(','))
        ].join('\n');

        downloadCSV(csvContent, filename);
      } else if (activeTab === 'reviewer') {
        data = reviewerData || [];
        filename = 'data-reviewer.csv';
        headers = ['Nama', 'Email', 'Institusi', 'BidangKeahlian', 'Tipe', 'Status'];
        
        const csvContent = [
          headers.join(','),
          ...data.map((r: any) => [
            `"${r.nama}"`,
            r.email,
            `"${r.institusi}"`,
            `"${r.bidangkeahlian?.nama || ''}"`,
            r.tipe,
            r.status
          ].join(','))
        ].join('\n');

        downloadCSV(csvContent, filename);
      }

      toast.success(`Data ${activeTab} berhasil di-export`);
    } catch (error) {
      toast.error('Gagal export data');
      console.error('Export error:', error);
    }
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle import
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const loadingToast = toast.loading('Memproses file CSV...');

      try {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim()); // Remove empty lines
        
        if (lines.length < 2) {
          toast.error('File CSV kosong atau tidak valid', { id: loadingToast });
          return;
        }

        // Parse CSV with proper quote handling
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]);
        const rows: any[] = [];

        // Parse CSV rows
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const rowData: any = {};
          
          headers.forEach((header, index) => {
            rowData[header.toLowerCase().replace(/\s+/g, '')] = values[index] || '';
          });
          
          rows.push(rowData);
        }

        let apiUrl = '';
        let requiredFields: string[] = [];

        // Validate and set API URL based on active tab
        if (activeTab === 'dosen') {
          requiredFields = ['nidn', 'nama', 'email'];
          apiUrl = '/api/dosen/bulk';
          
          // Map CSV fields to API fields
          const mappedRows = rows.map(row => ({
            nidn: row.nidn,
            nama: row.nama,
            email: row.email,
            noHp: row.nohp || row.notelp || '',
            bidangKeahlian: row.bidangkeahlian || '',
            status: row.status || 'AKTIF'
          }));
          
          toast.loading(`Mengimport ${mappedRows.length} dosen...`, { id: loadingToast });
          const result = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rows: mappedRows })
          });
          
          const data = await result.json();
          
          if (data.success) {
            console.log('📊 Import Result:', data.data);
            const successCount = data.data.success || 0;
            const failedCount = data.data.failed || 0;
            
            if (failedCount > 0) {
              console.error('❌ Import errors:', data.data.errors);
              toast.warning(
                `${successCount} berhasil, ${failedCount} gagal. Detail error:\n${data.data.errors.slice(0, 5).map((e: any) => `Baris ${e.row}: ${e.error}`).join('\n')}${data.data.errors.length > 5 ? `\n...dan ${data.data.errors.length - 5} lainnya` : ''}`,
                { id: loadingToast, duration: 10000 }
              );
            } else {
              toast.success(`${successCount} dosen berhasil diimport`, { id: loadingToast });
            }
            
            // Force refresh data dengan delay
            setTimeout(() => {
              refetchDosen();
              window.location.reload();
            }, 500);
          } else {
            toast.error(data.error || 'Gagal import data', { id: loadingToast });
          }
          
        } else if (activeTab === 'mahasiswa') {
          requiredFields = ['nim', 'nama', 'email', 'prodi', 'angkatan'];
          apiUrl = '/api/mahasiswa/bulk';
          
          const mappedRows = rows.map(row => ({
            nim: row.nim,
            nama: row.nama,
            email: row.email,
            prodi: row.prodi || row.programstudi || '',
            angkatan: row.angkatan || '',
            status: row.status || 'AKTIF'
          }));
          
          toast.loading(`Mengimport ${mappedRows.length} mahasiswa...`, { id: loadingToast });
          const result = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rows: mappedRows })
          });
          
          const data = await result.json();
          
          if (data.success) {
            console.log('📊 Import Result:', data.data);
            toast.success(data.message, { id: loadingToast });
            if (data.data.errors.length > 0) {
              console.error('❌ Import errors:', data.data.errors);
              toast.warning(`${data.data.errors.length} baris gagal diimport. Lihat console untuk detail.`);
            }
            // Force refresh data dengan delay
            setTimeout(() => {
              refetchMahasiswa();
              window.location.reload();
            }, 500);
          } else {
            toast.error(data.error || 'Gagal import data', { id: loadingToast });
          }
          
        } else if (activeTab === 'reviewer') {
          requiredFields = ['nama', 'email', 'institusi', 'tipe'];
          apiUrl = '/api/reviewer/bulk';
          
          const mappedRows = rows.map(row => ({
            nama: row.nama,
            email: row.email,
            institusi: row.institusi,
            bidangKeahlian: row.bidangkeahlian || '',
            tipe: row.tipe || 'EKSTERNAL',
            status: row.status || 'AKTIF'
          }));
          
          toast.loading(`Mengimport ${mappedRows.length} reviewer...`, { id: loadingToast });
          const result = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rows: mappedRows })
          });
          
          const data = await result.json();
          
          if (data.success) {
            console.log('📊 Import Result:', data.data);
            toast.success(data.message, { id: loadingToast });
            if (data.data.errors.length > 0) {
              console.error('❌ Import errors:', data.data.errors);
              toast.warning(`${data.data.errors.length} baris gagal diimport. Lihat console untuk detail.`);
            }
            // Force refresh data dengan delay
            setTimeout(() => {
              refetchReviewer();
              window.location.reload();
            }, 500);
          } else {
            toast.error(data.error || 'Gagal import data', { id: loadingToast });
          }
        }
        
      } catch (error: any) {
        toast.error(error.message || 'Gagal membaca file CSV', { id: loadingToast });
        console.error('Import error:', error);
      }
    };
    input.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Data Master</h1>
            <p className="text-muted-foreground mt-1">
              Kelola data dosen, mahasiswa, dan reviewer
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getSelectedCount() > 0 && (
              <Button 
                variant="destructive" 
                onClick={() => setBulkDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Terpilih ({getSelectedCount()})
              </Button>
            )}
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Data
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Dosen</p>
                  <p className="text-3xl font-bold mt-2">
                    {dosenLoading ? '-' : dosenData?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Mahasiswa</p>
                  <p className="text-3xl font-bold mt-2">
                    {mahasiswaLoading ? '-' : mahasiswaData?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reviewer</p>
                  <p className="text-3xl font-bold mt-2">
                    {reviewerLoading ? '-' : reviewerData?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dosen">Dosen</TabsTrigger>
                <TabsTrigger value="mahasiswa">Mahasiswa</TabsTrigger>
                <TabsTrigger value="reviewer">Reviewer</TabsTrigger>
              </TabsList>

              {/* Tab Content - Dosen */}
              <TabsContent value="dosen" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Cari dosen..."
                      className="pl-10"
                      value={dosenSearch}
                      onChange={(e) => setDosenSearch(e.target.value)}
                    />
                  </div>
                </div>

                {dosenError && (
                  <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg">
                    {dosenError}
                  </div>
                )}

                {dosenLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                  </div>
                ) : (
                  <DataTable
                    columns={dosenColumns}
                    data={(dosenData || []).slice((dosenPage - 1) * dosenPageSize, dosenPage * dosenPageSize)}
                    pagination={{
                      page: dosenPage,
                      pageSize: dosenPageSize,
                      total: dosenData?.length || 0,
                      onPageChange: setDosenPage,
                      onPageSizeChange: (size) => {
                        setDosenPageSize(size);
                        setDosenPage(1);
                      }
                    }}
                  />
                )}
              </TabsContent>

              {/* Tab Content - Mahasiswa */}
              <TabsContent value="mahasiswa" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Cari mahasiswa..."
                      className="pl-10"
                      value={mahasiswaSearch}
                      onChange={(e) => setMahasiswaSearch(e.target.value)}
                    />
                  </div>
                </div>

                {mahasiswaError && (
                  <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg">
                    {mahasiswaError}
                  </div>
                )}

                {mahasiswaLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <DataTable
                    columns={mahasiswaColumns}
                    data={(mahasiswaData || []).slice((mahasiswaPage - 1) * mahasiswaPageSize, mahasiswaPage * mahasiswaPageSize)}
                    pagination={{
                      page: mahasiswaPage,
                      pageSize: mahasiswaPageSize,
                      total: mahasiswaData?.length || 0,
                      onPageChange: setMahasiswaPage,
                      onPageSizeChange: (size) => {
                        setMahasiswaPageSize(size);
                        setMahasiswaPage(1);
                      }
                    }}
                  />
                )}
              </TabsContent>

              {/* Tab Content - Reviewer */}
              <TabsContent value="reviewer" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Cari reviewer..."
                      className="pl-10"
                      value={reviewerSearch}
                      onChange={(e) => setReviewerSearch(e.target.value)}
                    />
                  </div>
                </div>

                {reviewerError && (
                  <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg">
                    {reviewerError}
                  </div>
                )}

                {reviewerLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                ) : (
                  <DataTable
                    columns={reviewerColumns}
                    data={(reviewerData || []).slice((reviewerPage - 1) * reviewerPageSize, reviewerPage * reviewerPageSize)}
                    pagination={{
                      page: reviewerPage,
                      pageSize: reviewerPageSize,
                      total: reviewerData?.length || 0,
                      onPageChange: setReviewerPage,
                      onPageSizeChange: (size) => {
                        setReviewerPageSize(size);
                        setReviewerPage(1);
                      }
                    }}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>

      {/* Dialogs */}
      <DosenFormDialog
        open={dosenDialogOpen}
        onOpenChange={setDosenDialogOpen}
        dosen={selectedDosen}
        bidangKeahlianList={bidangKeahlianData || []}
        onSuccess={() => {
          refetchDosen();
          setSelectedDosen(null);
        }}
      />

      <MahasiswaFormDialog
        open={mahasiswaDialogOpen}
        onOpenChange={setMahasiswaDialogOpen}
        mahasiswa={selectedMahasiswa}
        onSuccess={() => {
          refetchMahasiswa();
          setSelectedMahasiswa(null);
        }}
      />

      <ReviewerFormDialog
        open={reviewerDialogOpen}
        onOpenChange={setReviewerDialogOpen}
        reviewer={selectedReviewer}
        bidangKeahlianList={bidangKeahlianData || []}
        onSuccess={() => {
          refetchReviewer();
          setSelectedReviewer(null);
        }}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Hapus ${deleteTarget?.type === 'dosen' ? 'Dosen' : deleteTarget?.type === 'mahasiswa' ? 'Mahasiswa' : 'Reviewer'}`}
        description={`Apakah Anda yakin ingin menghapus ${deleteTarget?.name}? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title={`Hapus ${getSelectedCount()} ${activeTab === 'dosen' ? 'Dosen' : activeTab === 'mahasiswa' ? 'Mahasiswa' : 'Reviewer'}`}
        description={`Apakah Anda yakin ingin menghapus ${getSelectedCount()} ${activeTab === 'dosen' ? 'dosen' : activeTab === 'mahasiswa' ? 'mahasiswa' : 'reviewer'} yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleBulkDelete}
      />
    </DashboardLayout>
  );
}
