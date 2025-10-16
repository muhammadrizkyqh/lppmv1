"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  UserX,
  MoreVertical
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchFilter, USER_FILTERS } from "@/components/ui/search-filter";
import { NoUsersFound } from "@/components/ui/empty-states";
import { toast } from "sonner";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DataMasterPage() {
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter states for each tab
  const [dosenSearchValue, setDosenSearchValue] = useState('');
  const [dosenActiveFilters, setDosenActiveFilters] = useState<Record<string, string>>({});
  const [mahasiswaSearchValue, setMahasiswaSearchValue] = useState('');
  const [mahasiswaActiveFilters, setMahasiswaActiveFilters] = useState<Record<string, string>>({});
  const [reviewerSearchValue, setReviewerSearchValue] = useState('');
  const [reviewerActiveFilters, setReviewerActiveFilters] = useState<Record<string, string>>({});

  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setSearchValue("");
  };

  const handleViewUser = (user: any) => {
    toast.info(`Melihat detail ${user.nama}`, {
      description: "Membuka profil pengguna..."
    });
  };

  const handleEditUser = (user: any) => {
    toast.info(`Edit ${user.nama}`, {
      description: "Membuka form edit pengguna..."
    });
  };

  const handleDeleteUser = (user: any) => {
    toast.success(`${user.nama} berhasil dihapus`, {
      description: "Data pengguna telah dihapus dari sistem"
    });
  };

  // Mock data
  const dosenData = [
    {
      id: "1",
      nidn: "2112345678",
      nama: "Dr. Ahmad Suharto, M.Pd",
      email: "ahmad.suharto@staiali.ac.id",
      noHp: "081234567890",
      bidangKeahlian: "Pendidikan Agama Islam",
      jenisDosen: "tetap",
      status: "aktif",
      proposalAktif: 2,
      totalProposal: 5
    },
    {
      id: "2",
      nidn: "2123456789",
      nama: "Dr. Siti Aminah, S.Pd.I, M.A",
      email: "siti.aminah@staiali.ac.id",
      noHp: "081234567891",
      bidangKeahlian: "Pendidikan Bahasa Arab",
      jenisDosen: "tetap",
      status: "aktif",
      proposalAktif: 1,
      totalProposal: 3
    },
    {
      id: "3",
      nidn: "2134567890",
      nama: "Prof. Dr. Muhammad Ridwan, M.Ag",
      email: "m.ridwan@staiali.ac.id",
      noHp: "081234567892",
      bidangKeahlian: "Hukum Ekonomi Syariah",
      jenisDosen: "tetap",
      status: "aktif",
      proposalAktif: 3,
      totalProposal: 8
    }
  ];

  const mahasiswaData = [
    {
      id: "1",
      nim: "2021001",
      nama: "Muhammad Rifqi Pratama",
      email: "rifqi.pratama@student.staiali.ac.id",
      prodi: "Pendidikan Agama Islam",
      angkatan: "2021",
      status: "aktif",
      proposalTerlibat: 2
    },
    {
      id: "2",
      nim: "2021002",
      nama: "Fatimah Zahra",
      email: "fatimah.zahra@student.staiali.ac.id",
      prodi: "Pendidikan Bahasa Arab",
      angkatan: "2021",
      status: "aktif",
      proposalTerlibat: 1
    },
    {
      id: "3",
      nim: "2020015",
      nama: "Abdullah Al-Farisi",
      email: "abdullah.alfarisi@student.staiali.ac.id",
      prodi: "Hukum Ekonomi Syariah",
      angkatan: "2020",
      status: "aktif",
      proposalTerlibat: 3
    }
  ];

  const reviewerData = [
    {
      id: "R001",
      nama: "Prof. Dr. Ahmad Wijaya, M.T.",
      email: "ahmad.wijaya@ui.ac.id",
      instansi: "Universitas Indonesia",
      bidangKeahlian: "Teknologi Informasi",
      level: "senior",
      status: "aktif",
      proposalDireview: 8
    },
    {
      id: "R002", 
      nama: "Dr. Siti Nurhaliza, M.Kom.",
      email: "siti.nurhaliza@itb.ac.id",
      instansi: "Institut Teknologi Bandung",
      bidangKeahlian: "Sistem Informasi",
      level: "senior",
      status: "aktif",
      proposalDireview: 6
    },
    {
      id: "R003",
      nama: "Dr. Bambang Suryanto, M.T.",
      email: "bambang.suryanto@ugm.ac.id", 
      instansi: "Universitas Gadjah Mada",
      bidangKeahlian: "Teknik Komputer",
      level: "junior",
      status: "aktif",
      proposalDireview: 4
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aktif":
        return <Badge variant="outline" className="text-green-600 border-green-200">Aktif</Badge>;
      case "nonaktif":
        return <Badge variant="outline" className="text-red-600 border-red-200">Non-aktif</Badge>;
      case "cuti":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Cuti</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getJenisDosenBadge = (jenis: string) => {
    switch (jenis) {
      case "tetap":
        return <Badge variant="default">Tetap</Badge>;
      case "tidak_tetap":
        return <Badge variant="secondary">Tidak Tetap</Badge>;
      default:
        return <Badge variant="secondary">{jenis}</Badge>;
    }
  };

  const stats = [
    { label: "Total Dosen", value: dosenData.length, icon: Users, color: "text-blue-600" },
    { label: "Dosen Aktif", value: dosenData.filter(d => d.status === "aktif").length, icon: UserCheck, color: "text-green-600" },
    { label: "Total Mahasiswa", value: mahasiswaData.length, icon: GraduationCap, color: "text-purple-600" },
    { label: "Mahasiswa Aktif", value: mahasiswaData.filter(m => m.status === "aktif").length, icon: BookOpen, color: "text-orange-600" }
  ];

  const dosenColumns = [
    {
      key: 'nama' as const,
      header: 'Nama',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.nama}`} />
            <AvatarFallback>{row.nama.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-sm text-muted-foreground">{row.nidn}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email' as const,
      header: 'Email',
      sortable: true
    },
    {
      key: 'bidangKeahlian' as const,
      header: 'Bidang Keahlian',
      sortable: true
    },
    {
      key: 'jenisDosen' as const,
      header: 'Jenis Dosen',
      sortable: true,
      render: (value: string) => (
        <Badge variant={value === 'tetap' ? 'default' : 'secondary'}>
          {value === 'tetap' ? 'Tetap' : 'Tidak Tetap'}
        </Badge>
      )
    },
    {
      key: 'status' as const,
      header: 'Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />
    }
  ];

  const mahasiswaColumns = [
    {
      key: 'nama' as const,
      header: 'Nama',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.nama}`} />
            <AvatarFallback>{row.nama.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-sm text-muted-foreground">{row.nim}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email' as const,
      header: 'Email',
      sortable: true
    },
    {
      key: 'prodi' as const,
      header: 'Program Studi',
      sortable: true
    },
    {
      key: 'semester' as const,
      header: 'Semester',
      sortable: true,
      render: (value: number) => `Semester ${value}`
    },
    {
      key: 'status' as const,
      header: 'Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />
    }
  ];

  const reviewerColumns = [
    {
      key: 'nama' as const,
      header: 'Nama',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.nama}`} />
            <AvatarFallback>{row.nama.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-sm text-muted-foreground">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'instansi' as const,
      header: 'Instansi',
      sortable: true
    },
    {
      key: 'bidangKeahlian' as const,
      header: 'Bidang Keahlian',
      sortable: true
    },
    {
      key: 'level' as const,
      header: 'Level',
      sortable: true,
      render: (value: string) => (
        <Badge variant={value === 'senior' ? 'default' : 'secondary'}>
          {value === 'senior' ? 'Senior' : 'Junior'}
        </Badge>
      )
    },
    {
      key: 'proposalDireview' as const,
      header: 'Proposal Direview',
      sortable: true,
      render: (value: number) => (
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          {value}
        </Badge>
      )
    },
    {
      key: 'status' as const,
      header: 'Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Master</h1>
            <p className="text-muted-foreground mt-2">
              Kelola data dosen, mahasiswa, dan reviewer sistem LPPM
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button className="bg-gradient-to-r from-primary to-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Data
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="dosen" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dosen">
              <Users className="w-4 h-4 mr-2" />
              Data Dosen ({dosenData.length})
            </TabsTrigger>
            <TabsTrigger value="mahasiswa">
              <GraduationCap className="w-4 h-4 mr-2" />
              Data Mahasiswa ({mahasiswaData.length})
            </TabsTrigger>
            <TabsTrigger value="reviewer">
              <BookOpen className="w-4 h-4 mr-2" />
              Data Reviewer (0)
            </TabsTrigger>
          </TabsList>

          {/* Dosen Tab */}
          <TabsContent value="dosen" className="space-y-4">
            {/* Search and Filter */}
            <SearchFilter
              placeholder="Cari dosen berdasarkan nama, NIDN, atau bidang keahlian..."
              searchValue={dosenSearchValue}
              activeFilters={dosenActiveFilters}
              filters={[
                {
                  key: 'status',
                  type: 'select',
                  label: 'Status',
                  options: [
                    { label: 'Aktif', value: 'aktif' },
                    { label: 'Tidak Aktif', value: 'tidak-aktif' },
                  ]
                },
                {
                  key: 'jenisDosen',
                  type: 'select',
                  label: 'Jenis Dosen',
                  options: [
                    { label: 'Tetap', value: 'tetap' },
                    { label: 'Tidak Tetap', value: 'tidak-tetap' },
                  ]
                }
              ]}
              onSearchChange={setDosenSearchValue}
              onFilterChange={(key: string, value: any) => {
                setDosenActiveFilters(prev => ({ ...prev, [key]: value }));
              }}
              onClearFilters={() => {
                setDosenSearchValue('');
                setDosenActiveFilters({});
              }}
            />

            {/* Dosen Data Table */}
            <DataTable
              data={dosenData}
              columns={dosenColumns}
              pagination={{
                page: currentPage,
                pageSize: pageSize,
                total: dosenData.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: setPageSize
              }}
            />
          </TabsContent>

          {/* Mahasiswa Tab */}
          <TabsContent value="mahasiswa" className="space-y-4">
            <SearchFilter
              placeholder="Cari mahasiswa berdasarkan nama, NIM, atau prodi..."
              searchValue={mahasiswaSearchValue}
              activeFilters={mahasiswaActiveFilters}
              filters={[
                {
                  key: 'status',
                  type: 'select',
                  label: 'Status',
                  options: [
                    { label: 'Aktif', value: 'aktif' },
                    { label: 'Tidak Aktif', value: 'tidak-aktif' },
                    { label: 'Lulus', value: 'lulus' },
                  ]
                },
                {
                  key: 'prodi',
                  type: 'select',
                  label: 'Program Studi',
                  options: [
                    { label: 'Teknik Informatika', value: 'teknik-informatika' },
                    { label: 'Sistem Informasi', value: 'sistem-informasi' },
                    { label: 'Teknik Komputer', value: 'teknik-komputer' },
                  ]
                }
              ]}
              onSearchChange={setMahasiswaSearchValue}
              onFilterChange={(key: string, value: any) => {
                setMahasiswaActiveFilters(prev => ({ ...prev, [key]: value }));
              }}
              onClearFilters={() => {
                setMahasiswaSearchValue('');
                setMahasiswaActiveFilters({});
              }}
            />

            <DataTable
              data={mahasiswaData}
              columns={mahasiswaColumns.filter(col => col.key !== 'semester')}
              pagination={{
                page: currentPage,
                pageSize: pageSize,
                total: mahasiswaData.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: setPageSize
              }}
            />

            {/* Mahasiswa List */}
            <div className="space-y-4">
              {mahasiswaData.map((mahasiswa) => (
                <Card key={mahasiswa.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`/placeholder-avatar-mhs-${mahasiswa.id}.jpg`} />
                          <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                            {mahasiswa.nama.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{mahasiswa.nama}</h3>
                            {getStatusBadge(mahasiswa.status)}
                          </div>
                          
                          <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">NIM:</span>
                              <span>{mahasiswa.nim}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4" />
                              <span>{mahasiswa.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="w-4 h-4" />
                              <span>{mahasiswa.prodi}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Angkatan:</span>
                              <span>{mahasiswa.angkatan}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 text-sm">
                            <span className="text-muted-foreground">Proposal Terlibat:</span>
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              {mahasiswa.proposalTerlibat}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Data
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus Data
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reviewer Tab */}
          <TabsContent value="reviewer" className="space-y-4">
            <SearchFilter
              placeholder="Cari reviewer berdasarkan nama, instansi, atau bidang keahlian..."
              searchValue={reviewerSearchValue}
              activeFilters={reviewerActiveFilters}
              filters={[
                {
                  key: 'status',
                  type: 'select',
                  label: 'Status',
                  options: [
                    { label: 'Aktif', value: 'aktif' },
                    { label: 'Tidak Aktif', value: 'tidak-aktif' },
                  ]
                },
                {
                  key: 'level',
                  type: 'select',
                  label: 'Level',
                  options: [
                    { label: 'Senior', value: 'senior' },
                    { label: 'Junior', value: 'junior' },
                  ]
                }
              ]}
              onSearchChange={setReviewerSearchValue}
              onFilterChange={(key: string, value: any) => {
                setReviewerActiveFilters(prev => ({ ...prev, [key]: value }));
              }}
              onClearFilters={() => {
                setReviewerSearchValue('');
                setReviewerActiveFilters({});
              }}
            />

            <DataTable
              data={reviewerData}
              columns={reviewerColumns}
              pagination={{
                page: currentPage,
                pageSize: pageSize,
                total: reviewerData.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: setPageSize
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}