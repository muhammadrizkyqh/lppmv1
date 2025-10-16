import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  BellOff,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  Star,
  Trash2,
  Check,
  Settings
} from "lucide-react";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "deadline",
      icon: AlertTriangle,
      title: "Deadline Monitoring 2",
      message: "Deadline monitoring 2 untuk proposal 'Pengembangan Aplikasi Mobile' dalam 3 hari",
      timestamp: "2025-01-20 09:30",
      isRead: false,
      priority: "high",
      actionUrl: "/dashboard/monitoring"
    },
    {
      id: 2,
      type: "review",
      icon: Star,
      title: "Hasil Review Tersedia",
      message: "Review proposal 'Sistem Informasi Perpustakaan' telah selesai dengan skor 85",
      timestamp: "2025-01-19 14:15",
      isRead: false,
      priority: "medium",
      actionUrl: "/dashboard/proposals"
    },
    {
      id: 3,
      type: "assignment",
      icon: User,
      title: "Tugas Review Baru",
      message: "Anda mendapat tugas review proposal 'Analisis Big Data untuk E-Commerce'",
      timestamp: "2025-01-19 10:00",
      isRead: true,
      priority: "medium",
      actionUrl: "/dashboard/review"
    },
    {
      id: 4,
      type: "reminder",
      icon: Clock,
      title: "Reminder Upload Laporan",
      message: "Jangan lupa upload laporan monitoring 1 sebelum tanggal 1 Juli 2025",
      timestamp: "2025-01-18 08:00",
      isRead: true,
      priority: "low",
      actionUrl: "/dashboard/monitoring"
    },
    {
      id: 5,
      type: "announcement",
      icon: FileText,
      title: "Pengumuman Skema Baru",
      message: "Skema penelitian baru 'Penelitian Kolaboratif' telah dibuka untuk periode 2025",
      timestamp: "2025-01-17 16:30",
      isRead: true,
      priority: "medium",
      actionUrl: "/dashboard/proposals/create"
    },
    {
      id: 6,
      type: "system",
      icon: Settings,
      title: "Pemeliharaan Sistem",
      message: "Sistem akan mengalami pemeliharaan pada 25 Januari 2025, 02:00-04:00 WIB",
      timestamp: "2025-01-16 12:00",
      isRead: true,
      priority: "low",
      actionUrl: null
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="outline" className="text-red-600 border-red-200">Penting</Badge>;
      case "medium":
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Sedang</Badge>;
      case "low":
        return <Badge variant="secondary">Rendah</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deadline":
        return "text-red-500";
      case "review":
        return "text-green-500";
      case "assignment":
        return "text-blue-500";
      case "reminder":
        return "text-orange-500";
      case "announcement":
        return "text-purple-500";
      case "system":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const todayNotifications = notifications.filter(n => {
    const notifDate = new Date(n.timestamp);
    const today = new Date();
    return notifDate.toDateString() === today.toDateString();
  });
  const yesterdayNotifications = notifications.filter(n => {
    const notifDate = new Date(n.timestamp);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return notifDate.toDateString() === yesterday.toDateString();
  });
  const olderNotifications = notifications.filter(n => {
    const notifDate = new Date(n.timestamp);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return notifDate < yesterday;
  });

  const renderNotificationGroup = (title: string, notifications: any[]) => {
    if (notifications.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="space-y-3">
          {notifications.map((notification) => {
            const IconComponent = notification.icon;
            return (
              <Card 
                key={notification.id} 
                className={`border-0 shadow-sm transition-all hover:shadow-md cursor-pointer ${
                  !notification.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 ${getTypeColor(notification.type)}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-medium text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          {getPriorityBadge(notification.priority)}
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString('id-ID')}
                        </p>
                        <div className="flex items-center space-x-1">
                          {notification.actionUrl && (
                            <Button size="sm" variant="outline" className="text-xs">
                              Lihat Detail
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-xs">
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs text-muted-foreground">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifikasi</h1>
            <p className="text-muted-foreground mt-2">
              Kelola semua notifikasi dan pemberitahuan sistem
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-primary border-primary">
              <Bell className="w-3 h-3 mr-1" />
              {unreadCount} belum dibaca
            </Badge>
            <Button variant="outline" size="sm">
              <Check className="w-4 h-4 mr-2" />
              Tandai Semua Terbaca
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Pengaturan
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                  <p className="text-xs text-muted-foreground">Total Notifikasi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                  <p className="text-xs text-muted-foreground">Belum Dibaca</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {notifications.filter(n => n.priority === 'high').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Prioritas Tinggi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{todayNotifications.length}</p>
                  <p className="text-xs text-muted-foreground">Hari Ini</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">
              <Bell className="w-4 h-4 mr-2" />
              Semua
            </TabsTrigger>
            <TabsTrigger value="deadline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Deadline
            </TabsTrigger>
            <TabsTrigger value="review">
              <Star className="w-4 h-4 mr-2" />
              Review
            </TabsTrigger>
            <TabsTrigger value="assignment">
              <User className="w-4 h-4 mr-2" />
              Tugas
            </TabsTrigger>
            <TabsTrigger value="announcement">
              <FileText className="w-4 h-4 mr-2" />
              Pengumuman
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Pengaturan
            </TabsTrigger>
          </TabsList>

          {/* All Notifications */}
          <TabsContent value="all" className="space-y-6">
            {renderNotificationGroup("Hari Ini", todayNotifications)}
            {todayNotifications.length > 0 && yesterdayNotifications.length > 0 && <Separator />}
            {renderNotificationGroup("Kemarin", yesterdayNotifications)}
            {(todayNotifications.length > 0 || yesterdayNotifications.length > 0) && olderNotifications.length > 0 && <Separator />}
            {renderNotificationGroup("Sebelumnya", olderNotifications)}
          </TabsContent>

          {/* Filter by Type */}
          {['deadline', 'review', 'assignment', 'announcement'].map(type => (
            <TabsContent key={type} value={type} className="space-y-6">
              {renderNotificationGroup(
                `Notifikasi ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                notifications.filter(n => n.type === type)
              )}
            </TabsContent>
          ))}

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Pengaturan Notifikasi</CardTitle>
                <CardDescription>
                  Atur preferensi notifikasi sesuai kebutuhan Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifikasi</p>
                      <p className="text-sm text-muted-foreground">Terima notifikasi melalui email</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Aktif
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifikasi Deadline</p>
                      <p className="text-sm text-muted-foreground">Pengingat deadline tugas dan proposal</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Aktif
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifikasi Review</p>
                      <p className="text-sm text-muted-foreground">Pemberitahuan hasil review dan tugas review</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Aktif
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pengumuman Sistem</p>
                      <p className="text-sm text-muted-foreground">Pengumuman dan informasi dari sistem</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Aktif
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Frekuensi Email</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="frequency" value="instant" className="text-primary" />
                      <span className="text-sm">Segera (Real-time)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="frequency" value="daily" className="text-primary" defaultChecked />
                      <span className="text-sm">Harian (Ringkasan harian)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="frequency" value="weekly" className="text-primary" />
                      <span className="text-sm">Mingguan (Ringkasan mingguan)</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-gradient-to-r from-primary to-primary/90">
                    Simpan Pengaturan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}