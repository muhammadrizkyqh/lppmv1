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
  RefreshCw
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

  // Dialog states
  const [dosenDialogOpen, setDosenDialogOpen] = useState(false);
  const [mahasiswaDialogOpen, setMahasiswaDialogOpen] = useState(false);
  const [reviewerDialogOpen, setReviewerDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDosen, setSelectedDosen] = useState<Dosen | null>(null);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<Reviewer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);

  // Fetch data dengan hooks
  const { data: dosenData, loading: dosenLoading, error: dosenError, refetch: refetchDosen } = useDosen({ search: dosenSearch });
  const { data: mahasiswaData, loading: mahasiswaLoading, error: mahasiswaError, refetch: refetchMahasiswa } = useMahasiswa({ search: mahasiswaSearch });
  const { data: reviewerData, loading: reviewerLoading, error: reviewerError, refetch: refetchReviewer } = useReviewer({ search: reviewerSearch });
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

  // Column definitions untuk Dosen
  const dosenColumns: any[] = [
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
          {row.bidangKeahlian?.nama || '-'}
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
          {row.bidangKeahlian?.nama || '-'}
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
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
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
                    data={dosenData || []}
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
                    data={mahasiswaData || []}
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
                    data={reviewerData || []}
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
    </DashboardLayout>
  );
}
