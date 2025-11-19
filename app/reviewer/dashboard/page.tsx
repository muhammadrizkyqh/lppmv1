"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  Calendar,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ReviewerDashboardStats {
  totalAssignments: number;
  pending: number;
  completed: number;
  avgScore: number;
  totalReviews: number;
}

export default function ReviewerDashboardPage() {
  const [stats, setStats] = useState<ReviewerDashboardStats>({
    totalAssignments: 0,
    pending: 0,
    completed: 0,
    avgScore: 0,
    totalReviews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setStats({
        totalAssignments: 5,
        pending: 2,
        completed: 3,
        avgScore: 82,
        totalReviews: 15,
      });
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const statCards = [
    {
      title: "Total Tugas",
      value: stats.totalAssignments,
      change: "+2",
      changeType: "positive" as const,
      icon: ClipboardList,
      description: "Tugas review Anda",
      href: "/reviewer/assignments",
    },
    {
      title: "Pending",
      value: stats.pending,
      change: "+1",
      changeType: "warning" as const,
      icon: Clock,
      description: "Belum direview",
      href: "/reviewer/assignments?status=PENDING",
    },
    {
      title: "Selesai",
      value: stats.completed,
      change: "+1",
      changeType: "positive" as const,
      icon: CheckCircle,
      description: "Review selesai",
      href: "/reviewer/assignments?status=COMPLETED",
    },
    {
      title: "Rata-rata Skor",
      value: stats.avgScore,
      change: "+3",
      changeType: "positive" as const,
      icon: Star,
      description: "Dari review Anda",
      href: "/reviewer/assignments",
    },
  ];

  if (isLoading) {
    return <DashboardLayout><div /></DashboardLayout>;
  }

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
                      className={`text-xs ${
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

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Review</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalReviews}</p>
                  <p className="text-xs text-muted-foreground">Sepanjang waktu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tingkat Penyelesaian</p>
                  <p className="text-2xl font-bold text-blue-600">95%</p>
                  <p className="text-xs text-muted-foreground">Review selesai tepat waktu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-amber-100">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deadline Terdekat</p>
                  <p className="text-2xl font-bold text-amber-600">2</p>
                  <p className="text-xs text-muted-foreground">Hari lagi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Pending Reviews */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Tugas Pending</CardTitle>
              <CardDescription>Review yang perlu diselesaikan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3 text-sm border-l-4 border-orange-500 pl-3 py-2">
                <div className="flex-1">
                  <p className="font-medium">Pengembangan Aplikasi Mobile</p>
                  <p className="text-xs text-muted-foreground">P-2025-001 - Deadline: 2 hari lagi</p>
                  <div className="mt-2">
                    <Link href="/reviewer/assignments/1">
                      <Button size="sm" variant="outline">
                        Review Sekarang
                        <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Urgent
                </Badge>
              </div>

              <div className="flex items-start space-x-3 text-sm border-l-4 border-blue-500 pl-3 py-2">
                <div className="flex-1">
                  <p className="font-medium">Implementasi Machine Learning</p>
                  <p className="text-xs text-muted-foreground">P-2025-002 - Deadline: 5 hari lagi</p>
                  <div className="mt-2">
                    <Link href="/reviewer/assignments/2">
                      <Button size="sm" variant="outline">
                        Review Sekarang
                        <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  Normal
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Review Terakhir</CardTitle>
              <CardDescription>Aktivitas review terbaru</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3 text-sm">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Review selesai</p>
                  <p className="text-xs text-muted-foreground">P-2025-003 - Skor: 85/100</p>
                  <p className="text-xs text-muted-foreground">2 jam yang lalu</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Review selesai</p>
                  <p className="text-xs text-muted-foreground">P-2025-004 - Skor: 78/100</p>
                  <p className="text-xs text-muted-foreground">1 hari yang lalu</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Review selesai</p>
                  <p className="text-xs text-muted-foreground">P-2025-005 - Skor: 92/100</p>
                  <p className="text-xs text-muted-foreground">2 hari yang lalu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
