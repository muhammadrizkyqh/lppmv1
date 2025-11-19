"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  FileText,
  Calendar,
  User,
  AlertCircle,
  Award,
} from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface ProposalReviewer {
  id: string;
  proposalId: string;
  status: string;
  deadline: string;
  assignedAt: string;
  proposal: {
    judul: string;
    abstrak: string;
    status: string;
    ketua: {
      nama: string;
      email: string;
    };
    skema: {
      nama: string;
      tipe: string;
    };
    periode: {
      tahun: string;
      nama: string;
    };
    bidangKeahlian?: {
      nama: string;
    };
  };
  review?: {
    id: string;
    nilaiTotal: number;
    rekomendasi: string;
    submittedAt: string;
  };
}

export default function ReviewerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<ProposalReviewer[]>([]);
  const [completed, setCompleted] = useState<ProposalReviewer[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pendingCount: 0,
    completedCount: 0,
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews/my-assignments');
      const data = await response.json();

      if (data.success) {
        setPending(data.data.pending || []);
        setCompleted(data.data.completed || []);
        setStats({
          total: data.data.total || 0,
          pendingCount: data.data.pendingCount || 0,
          completedCount: data.data.completedCount || 0,
        });
      } else {
        toast.error(data.error || 'Gagal memuat data');
      }
    } catch (error) {
      console.error('Fetch assignments error:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Terlambat', color: 'bg-red-500', days: Math.abs(diffDays) };
    } else if (diffDays === 0) {
      return { label: 'Hari ini', color: 'bg-orange-500', days: 0 };
    } else if (diffDays <= 2) {
      return { label: `${diffDays} hari lagi`, color: 'bg-yellow-500', days: diffDays };
    } else {
      return { label: `${diffDays} hari lagi`, color: 'bg-green-500', days: diffDays };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Memuat tugas review...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Tugas Review</h1>
          <p className="text-muted-foreground mt-1">
            Kelola dan submit review untuk proposal yang ditugaskan
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tugas</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Proposal ditugaskan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingCount}</div>
              <p className="text-xs text-muted-foreground">Belum direview</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedCount}</div>
              <p className="text-xs text-muted-foreground">Sudah direview</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="relative">
              Pending Review
              {stats.pendingCount > 0 && (
                <Badge className="ml-2 bg-orange-500">{stats.pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Selesai
              {stats.completedCount > 0 && (
                <Badge className="ml-2 bg-green-500">{stats.completedCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pending.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Tidak Ada Tugas Pending</h3>
                  <p className="text-muted-foreground text-center">
                    Anda tidak memiliki tugas review yang belum diselesaikan
                  </p>
                </CardContent>
              </Card>
            ) : (
              pending.map((assignment) => {
                const deadlineStatus = getDeadlineStatus(assignment.deadline);
                return (
                  <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {assignment.proposal.judul}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {assignment.proposal.abstrak}
                          </CardDescription>
                        </div>
                        <Badge className={`${deadlineStatus.color} ml-4`}>
                          <Clock className="w-3 h-3 mr-1" />
                          {deadlineStatus.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Ketua</p>
                            <p className="font-medium">{assignment.proposal.ketua.nama}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Skema</p>
                            <p className="font-medium">{assignment.proposal.skema.nama}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Periode</p>
                            <p className="font-medium">{assignment.proposal.periode.tahun}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Bidang</p>
                            <p className="font-medium">
                              {assignment.proposal.bidangKeahlian?.nama || '-'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Deadline Info */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="text-muted-foreground">Deadline Review</p>
                            <p className="font-semibold">{formatDate(assignment.deadline)}</p>
                          </div>
                          {deadlineStatus.days < 3 && deadlineStatus.days >= 0 && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Segera!
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        asChild 
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        <Link href={`/reviewer/assignments/${assignment.id}`}>
                          <FileText className="w-4 h-4 mr-2" />
                          Mulai Review
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="space-y-4">
            {completed.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Belum Ada Review Selesai</h3>
                  <p className="text-muted-foreground text-center">
                    Review yang sudah Anda selesaikan akan muncul di sini
                  </p>
                </CardContent>
              </Card>
            ) : (
              completed.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {assignment.proposal.judul}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {assignment.proposal.abstrak}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-500 ml-4">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Selesai
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Ketua</p>
                          <p className="font-medium">{assignment.proposal.ketua.nama}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Nilai Total</p>
                          <p className="font-medium text-green-600">
                            {assignment.review?.nilaiTotal || '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Rekomendasi</p>
                          <p className="font-medium">
                            {assignment.review?.rekomendasi || '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Direview</p>
                          <p className="font-medium">
                            {assignment.review?.submittedAt 
                              ? formatDate(assignment.review.submittedAt)
                              : '-'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* View Button */}
                    <Button 
                      asChild 
                      variant="outline"
                      className="w-full"
                    >
                      <Link href={`/reviewer/assignments/${assignment.id}`}>
                        <FileText className="w-4 h-4 mr-2" />
                        Lihat Detail Review
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
