"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  FileText,
  Users,
  Settings,
  Search,
  Bell,
  LogOut,
  User,
  BookOpen,
  ClipboardList,
  BarChart3,
  Calendar,
  Award,
  HelpCircle,
  GraduationCap,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface SessionUser {
  id: string;
  username: string;
  email: string;
  role: string;
  name?: string;
  nidn?: string;
  nim?: string;
}

// Navigation items by role
const getNavigationByRole = (role: string) => {
  // ADMIN - Full access
  if (role === "ADMIN") {
    return [
      {
        title: "Dashboard",
        items: [
          {
            title: "Overview",
            icon: Home,
            href: "/admin/dashboard",
            badge: null,
          },
        ],
      },
      {
        title: "Penelitian & PKM",
        items: [
          {
            title: "Semua Proposal",
            icon: FileText,
            href: "/admin/proposals",
            badge: null,
          },
          {
            title: "Review & Approval",
            icon: ClipboardList,
            href: "/admin/reviews",
            badge: null,
          },
          {
            title: "Monitoring",
            icon: BarChart3,
            href: "/admin/monitoring",
            badge: null,
          },
        ],
      },
      {
        title: "Data Master",
        items: [
          {
            title: "Kelola Data Master",
            icon: Users,
            href: "/admin/data-master",
            badge: null,
          },
        ],
      },
      {
        title: "Pengaturan",
        items: [
          {
            title: "Pengaturan Sistem",
            icon: Settings,
            href: "/admin/settings",
            badge: null,
          },
        ],
      },
    ];
  }

  // DOSEN - Can submit proposals, see own proposals, monitoring
  if (role === "DOSEN") {
    return [
      {
        title: "Dashboard",
        items: [
          {
            title: "Overview",
            icon: Home,
            href: "/dosen/dashboard",
            badge: null,
          },
        ],
      },
      {
        title: "Penelitian & PKM",
        items: [
          {
            title: "Proposal Saya",
            icon: FileText,
            href: "/dosen/proposals",
            badge: null,
          },
          {
            title: "Ajukan Proposal",
            icon: BookOpen,
            href: "/dosen/proposals/create",
            badge: null,
          },
        ],
      },
      {
        title: "Laporan",
        items: [
          {
            title: "Laporan Saya",
            icon: ClipboardList,
            href: "/dosen/reports",
            badge: null,
          },
        ],
      },
    ];
  }

  // REVIEWER - Can review assigned proposals
  if (role === "REVIEWER") {
    return [
      {
        title: "Dashboard",
        items: [
          {
            title: "Overview",
            icon: Home,
            href: "/reviewer/dashboard",
            badge: null,
          },
        ],
      },
      {
        title: "Review",
        items: [
          {
            title: "Tugas Review",
            icon: ClipboardList,
            href: "/reviewer/assignments",
            badge: null,
          },
        ],
      },
    ];
  }

  // MAHASISWA - Read-only, can see proposals they're part of
  if (role === "MAHASISWA") {
    return [
      {
        title: "Penelitian & PKM",
        items: [
          {
            title: "Penelitian Saya",
            icon: FileText,
            href: "/mahasiswa/proposals",
            badge: null,
          },
        ],
      },
    ];
  }

  // Default fallback
  return [];
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (data.success) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Session fetch error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [router]);

  // Logout handler
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // Clear localStorage
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        console.log("🗑️ Cleared localStorage");
        
        toast.success('Logout berhasil');
        router.push('/login');
        router.refresh();
      } else {
        toast.error('Logout gagal');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    const breadcrumbs = [{ name: 'Dashboard', href: '/dashboard' }];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      if (index === 0) return; // Skip 'dashboard'
      
      currentPath += `/${segment}`;
      const fullPath = `/dashboard${currentPath}`;
      
      // Convert segment to readable name
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({ name, href: fullPath });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Show loading state
  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          {/* Sidebar Skeleton */}
          <div className="w-64 border-r border-border/50 bg-background flex flex-col">
            <div className="p-4 border-b border-border/50 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-muted rounded"></div>
                  <div className="h-3 w-24 bg-muted rounded"></div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-6 animate-pulse overflow-y-auto">
              {[1, 2, 3].map((section) => (
                <div key={section} className="space-y-2">
                  <div className="h-3 w-24 bg-muted rounded mb-3"></div>
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center space-x-3 py-2">
                      <div className="w-5 h-5 bg-muted rounded"></div>
                      <div className="h-4 w-32 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border/50 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded"></div>
                  <div className="h-3 w-24 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Skeleton */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="border-b border-border/50 bg-background animate-pulse">
              <div className="flex h-16 items-center px-6 gap-4">
                <div className="h-5 w-5 bg-muted rounded"></div>
                <div className="flex-1">
                  <div className="h-4 w-48 bg-muted rounded"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-9 w-9 bg-muted rounded"></div>
                  <div className="h-9 w-9 bg-muted rounded"></div>
                </div>
              </div>
            </header>
            <main className="flex-1 p-6 overflow-y-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 w-64 bg-muted rounded"></div>
                <div className="h-4 w-48 bg-muted rounded"></div>
                <div className="grid gap-6 md:grid-cols-4 mt-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.username?.slice(0, 2).toUpperCase() || 'U';
  };

  // Get role badge color
  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'ADMIN': return 'bg-red-100 text-red-700';
      case 'DOSEN': return 'bg-blue-100 text-blue-700';
      case 'MAHASISWA': return 'bg-green-100 text-green-700';
      case 'REVIEWER': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-border/50">
          <SidebarHeader className="border-b border-border/50 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  LPPM STAI Ali
                </h2>
                <p className="text-xs text-muted-foreground">
                  Research Management
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <nav className="space-y-6">
              {getNavigationByRole(user?.role || "MAHASISWA").map((section, index) => (
                <div key={index}>
                  <h3 className="mb-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const isActive = pathname === item.href || 
                        (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')) ||
                        (item.href === '/dashboard' && pathname === '/dashboard');
                      
                      return (
                        <Link key={itemIndex} href={item.href}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={`w-full justify-start px-3 py-2 h-auto text-left transition-all duration-200 ${
                              isActive 
                                ? "bg-primary/10 text-primary border-l-2 border-primary shadow-sm" 
                                : "hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            <item.icon className={`w-4 h-4 mr-3 ${
                              isActive ? "text-primary" : "text-muted-foreground"
                            }`} />
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </SidebarContent>
          
          <SidebarFooter className="border-t border-border/50 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                  <Avatar className="w-8 h-8 mr-3">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{user?.name || user?.username}</p>
                    <p className="text-xs text-muted-foreground">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user?.name || user?.username}</p>
                    <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
                    <Badge className={`mt-1 ${getRoleBadgeColor()}`}>
                      {user?.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.role === 'ADMIN' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="flex-1">
          {/* Top Navigation Bar */}
          <header className="flex h-16 items-center justify-between border-b border-border/50 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <nav className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={breadcrumb.href} className="flex items-center space-x-2">
                    {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <Link
                      href={breadcrumb.href}
                      className={`hover:text-primary transition-colors ${
                        index === breadcrumbs.length - 1
                          ? 'text-foreground font-semibold'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {breadcrumb.name}
                    </Link>
                  </div>
                ))}
                <Badge variant="outline" className="text-xs ml-2">
                  Beta
                </Badge>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="relative">
                <Search className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  ⌘K
                </kbd>
              </Button>
              
              <Button variant="outline" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive"></span>
              </Button>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}