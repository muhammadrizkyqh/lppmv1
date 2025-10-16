"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DashboardSkeleton, StatsCardSkeleton } from "@/components/ui/loading-skeletons";
import { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Award,
  Calendar,
  ArrowRight,
  Plus
} from "lucide-react";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate API loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Mock data - akan diganti dengan API calls
  const stats = [
    {
      title: "Total Proposal",
      value: "24",
      change: "+12%",
      changeType: "positive" as const,
      icon: FileText,
      description: "Dari bulan lalu"
    },
    {
      title: "Dalam Review",
      value: "8",
      change: "+3",
      changeType: "positive" as const,
      icon: Clock,
      description: "Menunggu reviewer"
    },
    {
      title: "Diterima",
      value: "15",
      change: "+5",
      changeType: "positive" as const,
      icon: CheckCircle,
      description: "Proposal disetujui"
    },
    {
      title: "Perlu Tindakan",
      value: "3",
      change: "-2",
      changeType: "negative" as const,
      icon: AlertCircle,
      description: "Revisi & monitoring"
    }
  ];

  const recentProposals = [
    {
      id: "P-2025-001",
      title: "Pengembangan Aplikasi Mobile untuk Pembelajaran Al-Quran",
      status: "review",
      progress: 60,
      deadline: "2025-03-15",
      category: "Penelitian Terapan"
    },
    {
      id: "P-2025-002",
      title: "Implementasi Metode Machine Learning dalam Analisis Hadits",
      status: "diterima",
      progress: 85,
      deadline: "2025-04-20",
      category: "Penelitian Dasar"
    },
    {
      id: "P-2025-003",
      title: "Pelatihan Digital Marketing untuk UMKM Berbasis Syariah",
      status: "monitoring",
      progress: 40,
      deadline: "2025-05-10",
      category: "PKM"
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      task: "Upload laporan monitoring periode 1",
      deadline: "2025-03-10",
      priority: "high",
      proposal: "P-2025-001"
    },
    {
      id: 2,
      task: "Revisi proposal berdasarkan feedback reviewer",
      deadline: "2025-03-15",
      priority: "medium",
      proposal: "P-2025-004"
    },
    {
      id: 3,
      task: "Submit luaran penelitian - jurnal",
      deadline: "2025-03-20",
      priority: "low",
      proposal: "P-2025-002"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "review":
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Review</Badge>;
      case "diterima":
        return <Badge variant="outline" className="text-green-600 border-green-200">Diterima</Badge>;
      case "monitoring":
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Monitoring</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Selamat datang kembali! 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              Berikut adalah ringkasan aktivitas penelitian dan PKM Anda
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80">
            <Plus className="w-4 h-4 mr-2" />
            Ajukan Proposal Baru
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center space-x-1 mt-1">
                  <span className={`text-xs ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Proposals */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Proposal Terbaru</CardTitle>
                    <CardDescription>
                      Pantau progress proposal penelitian dan PKM
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    Lihat Semua
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProposals.map((proposal) => (
                    <div key={proposal.id} className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-primary">
                              {proposal.id}
                            </span>
                            {getStatusBadge(proposal.status)}
                          </div>
                          <h4 className="font-medium text-foreground line-clamp-2">
                            {proposal.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {proposal.category}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{proposal.progress}%</span>
                        </div>
                        <Progress value={proposal.progress} className="h-2" />
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-1" />
                            Deadline: {new Date(proposal.deadline).toLocaleDateString('id-ID')}
                          </div>
                          <Button variant="ghost" size="sm">
                            Detail
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Tasks */}
          <div>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Tugas Mendatang</CardTitle>
                <CardDescription>
                  Jangan lewatkan deadline penting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="p-3 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-foreground line-clamp-2">
                          {task.task}
                        </h4>
                        {getPriorityBadge(task.priority)}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(task.deadline).toLocaleDateString('id-ID')}
                        </div>
                        <div className="text-xs text-primary">
                          {task.proposal}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-4" size="sm">
                  Lihat Semua Tugas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tingkat Approval</p>
                  <p className="text-2xl font-bold text-primary">87%</p>
                  <p className="text-xs text-muted-foreground">+5% dari tahun lalu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kolaborasi</p>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                  <p className="text-xs text-muted-foreground">Peneliti terlibat</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-amber-100">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Luaran</p>
                  <p className="text-2xl font-bold text-amber-600">28</p>
                  <p className="text-xs text-muted-foreground">Publikasi & produk</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}