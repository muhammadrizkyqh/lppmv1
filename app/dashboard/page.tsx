"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isRedirecting) return;
    
    setIsRedirecting(true);
    
    // Fetch user session and redirect based on role
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          const role = data.user.role;
          
          // Redirect to role-specific dashboard
          switch (role) {
            case 'ADMIN':
              router.replace('/admin/dashboard');
              break;
            case 'DOSEN':
              router.replace('/dosen/dashboard');
              break;
            case 'REVIEWER':
              router.replace('/reviewer/dashboard');
              break;
            case 'MAHASISWA':
              router.replace('/mahasiswa/proposals');
              break;
            default:
              router.replace('/login');
          }
        } else {
          router.replace('/login');
        }
      })
      .catch((error) => {
        console.error('Failed to fetch session:', error);
        router.replace('/login');
      });
  }, [router, isRedirecting]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">Mengalihkan...</p>
      </div>
    </div>
  );
}
