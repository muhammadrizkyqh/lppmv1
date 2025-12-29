"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { mahasiswaApi } from "@/lib/api-client";
import type { Mahasiswa } from "@/lib/api-client";

interface MahasiswaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mahasiswa?: Mahasiswa | null;
  onSuccess: () => void;
}

const PRODI_LIST = [
  "Teknik Informatika",
  "Sistem Informasi",
  "Teknik Komputer",
  "Teknik Elektro",
  "Teknik Mesin",
  "Teknik Sipil",
  "Arsitektur",
  "Manajemen",
  "Akuntansi",
];

export function MahasiswaFormDialog({ open, onOpenChange, mahasiswa, onSuccess }: MahasiswaFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    nim: "",
    nama: "",
    email: "",
    password: "",
    prodi: "",
    angkatan: currentYear.toString(),
    status: "AKTIF",
  });

  useEffect(() => {
    if (mahasiswa) {
      setFormData({
        nim: mahasiswa.nim,
        nama: mahasiswa.nama,
        email: mahasiswa.email,
        password: "",
        prodi: mahasiswa.prodi,
        angkatan: mahasiswa.angkatan.toString(),
        status: mahasiswa.status,
      });
    } else {
      setFormData({
        nim: "",
        nama: "",
        email: "",
        password: "",
        prodi: "",
        angkatan: currentYear.toString(),
        status: "AKTIF",
      });
    }
  }, [mahasiswa, open, currentYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mahasiswa) {
        // Update existing mahasiswa
        await mahasiswaApi.update(mahasiswa.id, {
          nim: formData.nim,
          nama: formData.nama,
          email: formData.email,
          prodi: formData.prodi,
          angkatan: formData.angkatan,
          status: formData.status as "AKTIF" | "NONAKTIF",
          ...(formData.password && { password: formData.password }),
        });
        toast.success("Mahasiswa berhasil diupdate!");
      } else {
        // Create new mahasiswa
        if (!formData.password) {
          toast.error("Password wajib diisi untuk mahasiswa baru!");
          setLoading(false);
          return;
        }

        await mahasiswaApi.create({
          nim: formData.nim,
          nama: formData.nama,
          email: formData.email,
          password: formData.password,
          prodi: formData.prodi,
          angkatan: formData.angkatan,
          status: formData.status as "AKTIF" | "NONAKTIF",
        });
        toast.success("Mahasiswa berhasil ditambahkan!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mahasiswa ? "Edit Mahasiswa" : "Tambah Mahasiswa Baru"}</DialogTitle>
          <DialogDescription>
            {mahasiswa ? "Update informasi mahasiswa" : "Tambahkan mahasiswa baru ke sistem"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nim" className="text-right">
                NIM <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nim"
                value={formData.nim}
                onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nama" className="text-right">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
                required
              />
            </div>

            {!mahasiswa && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prodi" className="text-right">
                Program Studi <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.prodi}
                onValueChange={(value) => setFormData({ ...formData, prodi: value })}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih program studi" />
                </SelectTrigger>
                <SelectContent>
                  {PRODI_LIST.map((prodi) => (
                    <SelectItem key={prodi} value={prodi}>
                      {prodi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="angkatan" className="text-right">
                Angkatan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="angkatan"
                type="number"
                value={formData.angkatan}
                onChange={(e) => setFormData({ ...formData, angkatan: e.target.value })}
                className="col-span-3"
                min="2000"
                max={currentYear + 1}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AKTIF">Aktif</SelectItem>
                  <SelectItem value="NONAKTIF">Non-Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mahasiswa ? "Update" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
