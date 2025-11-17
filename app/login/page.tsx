"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, GraduationCap, BookOpen, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store user info in localStorage
        if (data.user) {
          localStorage.setItem("userRole", data.user.role);
          localStorage.setItem("userId", data.user.id);
          localStorage.setItem("userName", data.user.name || data.user.username);
          console.log("✅ Saved to localStorage:", {
            role: data.user.role,
            id: data.user.id,
            name: data.user.name || data.user.username
          });
        }
        
        toast.success('Login berhasil!', {
          description: `Selamat datang, ${data.user.name || data.user.username}`,
        });
        
        // Redirect after short delay
        setTimeout(() => {
          router.push(redirect);
          router.refresh();
        }, 500);
      } else {
        toast.error('Login gagal', {
          description: data.error || 'Terjadi kesalahan',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login gagal', {
        description: 'Terjadi kesalahan koneksi',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background to-secondary/20">
        <div className="w-full max-w-md space-y-6">
          {/* Logo and Title */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                LPPM STAI Ali
              </h1>
              <p className="text-muted-foreground mt-2">
                Sistem Informasi Penelitian & Pengabdian Masyarakat
              </p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-2xl shadow-primary/5">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold">Masuk</CardTitle>
              <CardDescription>
                Masukkan email dan password untuk mengakses sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Username atau Email</Label>
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    placeholder="admin atau admin@stai-ali.ac.id"
                    value={formData.identifier}
                    onChange={handleInputChange}
                    className="h-11"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="h-11 pr-10"
                      disabled={isLoading}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Masuk ke Sistem'
                  )}
                </Button>
              </form>
              
              <div className="text-center space-y-2">
                <div className="text-xs text-muted-foreground">
                  <p>Default password: <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">password123</code></p>
                  <p className="mt-1">Username: admin, dosen1, dosen2, mhs1, dll</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground">
            © 2025 STAI Ali. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative z-10 flex flex-col justify-center p-12 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Mengelola Penelitian & PKM
              <span className="block text-primary-foreground/90">dengan Mudah</span>
            </h2>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
              Platform digital terintegrasi untuk proposal, review, monitoring, 
              dan pelaporan penelitian serta pengabdian masyarakat
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Pengajuan Digital</h3>
                <p className="text-primary-foreground/70 text-sm">
                  Submit proposal penelitian tanpa perlu print dokumen
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Review Terintegrasi</h3>
                <p className="text-primary-foreground/70 text-sm">
                  Sistem review online dengan penilaian terstruktur
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Monitoring Real-time</h3>
                <p className="text-primary-foreground/70 text-sm">
                  Pantau progress penelitian dan kelola luaran
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-primary-foreground/5 blur-3xl" />
        <div className="absolute bottom-20 right-32 w-24 h-24 rounded-full bg-primary-foreground/10 blur-2xl" />
      </div>
    </div>
  );
}