"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText,
  Download,
  TrendingUp,
  AlertCircle,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api-client";

interface ProposalWithPencairan {
  id: string;
  judul: string;
  status: string;
  skema: {
    nama: string;
    dana: number;
  };
  pencairan_dana: Array<{
    id: string;
    termin: string;
    nominal: string;
    persentase: number;
    status: string;
    tanggalPencairan: string | null;
    keterangan: string | null;
    fileBukti: string | null;
    createdAt: string;
  }>;
}

export default function DosenPencairanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<ProposalWithPencairan[]>([]);
  const [stats, setStats] = useState({
    totalDana: 0,
    totalDicairkan: 0,
    totalPending: 0,
    jumlahProposal: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Get all approved proposals with pencairan data
      const response = await fetchApi("/api/proposal?status=DITERIMA,BERJALAN,SELESAI");
      
      if (response.success && response.data && Array.isArray(response.data)) {
        const proposalsData = response.data as ProposalWithPencairan[];
        setProposals(proposalsData);

        // Calculate stats
        let totalDana = 0;
        let totalDicairkan = 0;
        let totalPending = 0;

        proposalsData.forEach((proposal) => {
          totalDana += Number(proposal.skema?.dana || 0);
          proposal.pencairan_dana?.forEach((p) => {
            if (p.status === 'DICAIRKAN') {
              totalDicairkan += Number(p.nominal);
            } else if (p.status === 'PENDING') {
              totalPending += Number(p.nominal);
            }
          });
        });

        setStats({
          totalDana,
          totalDicairkan,
          totalPending,
          jumlahProposal: proposalsData.length
        });
      } else {
        setProposals([]);
        setStats({
          totalDana: 0,
          totalDicairkan: 0,
          totalPending: 0,
          jumlahProposal: 0
        });
      }
    } catch (error) {
      console.error('Error fetching pencairan:', error);
      toast.error("Gagal memuat data pencairan");
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: { label: "Pending", variant: "secondary" as const, icon: Clock },
      DICAIRKAN: { label: "Dicairkan", variant: "default" as const, icon: CheckCircle },
      DITOLAK: { label: "Ditolak", variant: "destructive" as const, icon: XCircle },
    };
    const info = statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
    const Icon = info.icon;
    
    return (
      <Badge variant={info.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {info.label}
      </Badge>
    );
  };

  const getTerminLabel = (termin: string) => {
    return termin.replace('TERMIN_', 'Termin ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Cek termin mana yang bisa diajukan berikutnya
  const getNextTermin = (proposal: ProposalWithPencairan): string | null => {
    if (!proposal.pencairan_dana) return 'TERMIN_1';
    
    const existingTermins = proposal.pencairan_dana.map(p => p.termin);
    const dicairkanTermins = proposal.pencairan_dana
      .filter(p => p.status === 'DICAIRKAN')
      .map(p => p.termin);
    
    // Termin 1: jika belum ada pencairan sama sekali
    if (!existingTermins.includes('TERMIN_1')) {
      return 'TERMIN_1';
    }
    
    // Termin 2: jika Termin 1 sudah dicairkan dan belum ada Termin 2
    if (dicairkanTermins.includes('TERMIN_1') && !existingTermins.includes('TERMIN_2')) {
      return 'TERMIN_2';
    }
    
    // Termin 3: jika Termin 2 sudah dicairkan dan belum ada Termin 3
    if (dicairkanTermins.includes('TERMIN_2') && !existingTermins.includes('TERMIN_3')) {
      return 'TERMIN_3';
    }
    
    return null;
  };

  const getNextTerminLabel = (termin: string) => {
    return termin.replace('TERMIN_', 'Termin ');
  };

  const getNextTerminRequirement = (termin: string) => {
    switch (termin) {
      case 'TERMIN_1':
        return 'Kontrak sudah ditandatangani, dapat mencairkan 50% dana';
      case 'TERMIN_2':
        return 'Termin 1 sudah dicairkan, upload dan verifikasi laporan kemajuan dulu';
      case 'TERMIN_3':
        return 'Termin 2 sudah dicairkan, upload dan verifikasi luaran dulu';
      default:
        return '';
    }
  };

  const handleAjukanPencairan = async (proposalId: string, termin: string) => {
    if (!confirm(`Apakah Anda yakin ingin mengajukan pencairan ${getNextTerminLabel(termin)}?`)) {
      return;
    }

    try {
      const response = await fetchApi('/api/pencairan', {
        method: 'POST',
        body: JSON.stringify({
          proposalId,
          termin,
          keterangan: `Pengajuan ${getNextTerminLabel(termin)} oleh dosen`
        })
      });

      if (response.success) {
        toast.success(`Pencairan ${getNextTerminLabel(termin)} berhasil diajukan`);
        fetchData(); // Refresh data
      } else {
        toast.error(response.error || 'Gagal mengajukan pencairan');
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Memuat data pencairan...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pencairan Dana</h1>
            <p className="text-muted-foreground mt-1">
              Kelola pencairan dana penelitian Anda
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proposal</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.jumlahProposal}</div>
              <p className="text-xs text-muted-foreground">Proposal yang disetujui</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dana</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalDana)}</div>
              <p className="text-xs text-muted-foreground">Dana keseluruhan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sudah Dicairkan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalDicairkan)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalDana > 0 
                  ? `${((stats.totalDicairkan / stats.totalDana) * 100).toFixed(1)}% dari total`
                  : '0%'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(stats.totalPending)}
              </div>
              <p className="text-xs text-muted-foreground">Menunggu persetujuan</p>
            </CardContent>
          </Card>
        </div>

        {/* Pencairan List by Proposal */}
        {proposals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Pencairan</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Pencairan dana akan otomatis dibuat setelah kontrak penelitian ditandatangani oleh admin.
              </p>
              <Button className="mt-6" onClick={() => router.push('/dosen/proposals')}>
                <FileText className="h-4 w-4 mr-2" />
                Lihat Proposal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <Card key={proposal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-xl">{proposal.judul}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {proposal.skema.nama}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(Number(proposal.skema.dana))}
                        </span>
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dosen/proposals/${proposal.id}`)}
                    >
                      Detail Proposal
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Tombol Ajukan Pencairan */}
                    {proposal.status === 'BERJALAN' && getNextTermin(proposal) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-blue-900 mb-1">
                              Anda bisa mengajukan {getNextTerminLabel(getNextTermin(proposal)!)}
                            </p>
                            <p className="text-sm text-blue-700">
                              {getNextTerminRequirement(getNextTermin(proposal)!)}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleAjukanPencairan(proposal.id, getNextTermin(proposal)!)}
                            className="shrink-0"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajukan
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* List Pencairan */}
                    {!proposal.pencairan_dana || proposal.pencairan_dana.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Belum ada pencairan untuk proposal ini</p>
                        <p className="text-xs mt-1">Ajukan pencairan setelah kontrak ditandatangani</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {proposal.pencairan_dana.map((item) => (
                        <div
                          key={item.id}
                          className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{getTerminLabel(item.termin)}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {item.persentase}%
                                </Badge>
                              </div>
                              <p className="text-2xl font-bold text-primary">
                                {formatCurrency(Number(item.nominal))}
                              </p>
                            </div>
                            <div>
                              {getStatusBadge(item.status)}
                            </div>
                          </div>

                          {item.tanggalPencairan && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>Dicairkan: {formatDate(item.tanggalPencairan)}</span>
                            </div>
                          )}

                          {item.keterangan && (
                            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                              <p className="font-medium mb-1">Keterangan:</p>
                              <p>{item.keterangan}</p>
                            </div>
                          )}

                          {item.fileBukti && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a href={item.fileBukti} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Bukti Pencairan
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
