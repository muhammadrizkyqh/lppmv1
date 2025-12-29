"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { dosenApi } from "@/lib/api-client";
import type { Dosen, BidangKeahlian } from "@/lib/api-client";

interface DosenFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dosen?: Dosen | null;
  bidangKeahlianList: BidangKeahlian[];
  onSuccess: () => void;
}

export function DosenFormDialog({ open, onOpenChange, dosen, bidangKeahlianList, onSuccess }: DosenFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nidn: "",
    nama: "",
    email: "",
    password: "",
    noHp: "",
    bidangKeahlianId: "",
    status: "AKTIF",
  });

  useEffect(() => {
    if (dosen) {
      setFormData({
        nidn: dosen.nidn,
        nama: dosen.nama,
        email: dosen.email,
        password: "",
        noHp: dosen.noHp || "",
        bidangKeahlianId: dosen.bidangKeahlianId?.toString() || "",
        status: dosen.status,
      });
    } else {
      setFormData({
        nidn: "",
        nama: "",
        email: "",
        password: "",
        noHp: "",
        bidangKeahlianId: "",
        status: "AKTIF",
      });
    }
  }, [dosen, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (dosen) {
        // Update existing dosen
        await dosenApi.update(dosen.id, {
          nidn: formData.nidn,
          nama: formData.nama,
          email: formData.email,
          noHp: formData.noHp || undefined,
          bidangKeahlianId: formData.bidangKeahlianId || undefined,
          status: formData.status as "AKTIF" | "NONAKTIF",
          ...(formData.password && { password: formData.password }),
        });
        toast.success("Dosen berhasil diupdate!");
      } else {
        // Create new dosen
        if (!formData.password) {
          toast.error("Password wajib diisi untuk dosen baru!");
          setLoading(false);
          return;
        }

        await dosenApi.create({
          nidn: formData.nidn,
          nama: formData.nama,
          email: formData.email,
          password: formData.password,
          noHp: formData.noHp || undefined,
          bidangKeahlianId: formData.bidangKeahlianId || undefined,
          status: formData.status as "AKTIF" | "NONAKTIF",
        });
        toast.success("Dosen berhasil ditambahkan!");
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
          <DialogTitle>{dosen ? "Edit Dosen" : "Tambah Dosen Baru"}</DialogTitle>
          <DialogDescription>
            {dosen ? "Update informasi dosen" : "Tambahkan dosen baru ke sistem"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nidn" className="text-right">
                NIDN <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nidn"
                value={formData.nidn}
                onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password {!dosen && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="col-span-3"
                placeholder={dosen ? "Kosongkan jika tidak ingin mengubah" : ""}
                required={!dosen}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="noHp" className="text-right">
                No. HP
              </Label>
              <Input
                id="noHp"
                value={formData.noHp}
                onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bidangKeahlian" className="text-right">
                Bidang Keahlian
              </Label>
              <Select
                value={formData.bidangKeahlianId}
                onValueChange={(value) => setFormData({ ...formData, bidangKeahlianId: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih bidang keahlian" />
                </SelectTrigger>
                <SelectContent>
                  {bidangKeahlianList.map((bidang) => (
                    <SelectItem key={bidang.id} value={bidang.id.toString()}>
                      {bidang.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {dosen ? "Update" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
