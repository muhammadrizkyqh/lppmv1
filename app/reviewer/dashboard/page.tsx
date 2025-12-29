"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Clock,
  CheckCircle,
  ClipboardList,
  ArrowRight,
  Star,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface ReviewerDashboardData {
  reviewerName: string;
  stats: {
    totalAssignments: number;
    pending: number;
    completed: number;
    avgScore: number;
    totalReviews: number;
    completionRate: number;
    nearestDeadline: number | null;
  };
  pendingTasks: Array<{
    id: string;
    proposalId: string;
    judul: string;
    deadline: string;
    daysUntilDeadline: number;
    urgency: 'urgent' | 'normal';
    skema: string;
    periode: string;
    dosen: string;
  }>;
  recentReviews: Array<{
    id: string;
    proposalId: string;
    judul: string;
    nilaiTotal: number;
    submittedAt: string;
  }>;
}

export default function ReviewerDashboardPage() {
  const [data, setData] = useState<ReviewerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard/reviewer');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Gagal memuat data');
        toast.error(result.error || 'Gagal memuat data dashboard');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Terjadi kesalahan koneksi');
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-muted-foreground">{error || 'Gagal memuat data'}</p>
          <Button onClick={fetchDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      title: "Total Tugas",
      value: data.stats.totalAssignments,
      change: `${data.stats.completionRate}%`,
      changeType: "neutral" as const,
      icon: ClipboardList,
      description: "Tugas review Anda",
      href: "/reviewer/assignments",
    },
    {
      title: "Pending",
      value: data.stats.pending,
      change: data.stats.nearestDeadline ? `${data.stats.nearestDeadline} hari` : "Tidak ada",
      changeType: data.stats.pending > 0 ? ("warning" as const) : ("neutral" as const),
      icon: Clock,
      description: data.stats.nearestDeadline ? "Deadline terdekat" : "Belum direview",
      href: "/reviewer/assignments?status=PENDING",
    },
    {
      title: "Selesai",
      value: data.stats.completed,
      change: `${data.stats.totalReviews} review`,
      changeType: "positive" as const,
      icon: CheckCircle,
      description: "Review selesai",
      href: "/reviewer/assignments?status=COMPLETED",
    },
    {
      title: "Rata-rata Skor",
      value: data.stats.avgScore,
      change: data.stats.completed > 0 ? "Aktif" : "Belum ada",
      changeType: data.stats.completed > 0 ? ("positive" as const) : ("neutral" as const),
      icon: Star,
      description: "Dari review Anda",
      href: "/reviewer/assignments",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard Reviewer
            </h1>
            <p className="text-muted-foreground mt-2">
              Kelola tugas review proposal Anda
            </p>
          </div>
          <Link href="/reviewer/assignments">
            <Button className="bg-gradient-to-r from-primary to-primary/90">
              <ClipboardList className="w-4 h-4 mr-2" />
              Lihat Semua Tugas
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.title === "Rata-rata Skor" ? `${stat.value}%` : stat.value}
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <span
                      className={`text-xs font-medium ${
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : stat.changeType === "warning"
                          ? "text-orange-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stat.description}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Pending Tasks & Recent Reviews */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pending Tasks */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Tugas Pending</CardTitle>
              <CardDescription>Review yang perlu diselesaikan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.pendingTasks.length > 0 ? (
                data.pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start space-x-3 text-sm border-l-4 pl-3 py-2 ${
                      task.urgency === 'urgent' ? 'border-orange-500' : 'border-primary/30'
                    }`}
                  >
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{task.judul}</p>
                      <div className="space-y-0.5 text-xs text-muted-foreground">
                        <p>Skema: {task.skema} • {task.periode}</p>
                        <p>Dosen: {task.dosen}</p>
                        <p className={task.urgency === 'urgent' ? 'text-orange-600 font-medium' : ''}>
                          Deadline: {task.daysUntilDeadline} hari lagi
                        </p>
                      </div>
                      <div className="mt-2">
                        <Link href={`/reviewer/assignments/${task.id}`}>
                          <Button size="sm" variant="outline">
                            Review Sekarang
                            <ArrowRight className="w-3 h-3 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        task.urgency === 'urgent'
                          ? 'text-orange-600 border-orange-200'
                          : 'text-muted-foreground border-muted'
                      }
                    >
                      {task.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Tidak ada tugas pending</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Review Terakhir</CardTitle>
              <CardDescription>Aktivitas review terbaru</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.recentReviews.length > 0 ? (
                data.recentReviews.map((review) => (
                  <div key={review.id} className="flex items-start space-x-3 text-sm">
                    <div className="p-2 rounded-lg bg-green-100">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{review.judul}</p>
                      <p className="text-xs text-muted-foreground">
                        Skor: {review.nilaiTotal}/100
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.submittedAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Belum ada review</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
