"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { reviewerApi } from "@/lib/api-client";
import type { Reviewer, BidangKeahlian } from "@/lib/api-client";

interface ReviewerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewer?: Reviewer | null;
  bidangKeahlianList: BidangKeahlian[];
  onSuccess: () => void;
}

export function ReviewerFormDialog({ open, onOpenChange, reviewer, bidangKeahlianList, onSuccess }: ReviewerFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    institusi: "",
    tipe: "INTERNAL" as "INTERNAL" | "EKSTERNAL",
    bidangKeahlianId: "",
    noHp: "",
    status: "AKTIF",
  });

  useEffect(() => {
    if (reviewer) {
      setFormData({
        nama: reviewer.nama,
        email: reviewer.email,
        password: "",
        institusi: reviewer.institusi,
        tipe: reviewer.tipe,
        bidangKeahlianId: reviewer.bidangKeahlianId?.toString() || "",
        noHp: reviewer.user?.username || "",
        status: reviewer.status,
      });
    } else {
      setFormData({
        nama: "",
        email: "",
        password: "",
        institusi: "",
        tipe: "INTERNAL",
        bidangKeahlianId: "",
        noHp: "",
        status: "AKTIF",
      });
    }
  }, [reviewer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (reviewer) {
        // Update existing reviewer
        await reviewerApi.update(reviewer.id, {
          nama: formData.nama,
          email: formData.email,
          institusi: formData.institusi,
          tipe: formData.tipe,
          bidangKeahlianId: formData.bidangKeahlianId || undefined,
          noHp: formData.noHp || undefined,
          status: formData.status as "AKTIF" | "NONAKTIF",
          ...(formData.password && { password: formData.password }),
        });
        toast.success("Reviewer berhasil diupdate!");
      } else {
        // Create new reviewer
        if (!formData.password) {
          toast.error("Password wajib diisi untuk reviewer baru!");
          setLoading(false);
          return;
        }

        await reviewerApi.create({
          nama: formData.nama,
          email: formData.email,
          password: formData.password,
          institusi: formData.institusi,
          tipe: formData.tipe,
          bidangKeahlianId: formData.bidangKeahlianId || undefined,
          noHp: formData.noHp || undefined,
          status: formData.status as "AKTIF" | "NONAKTIF",
        });
        toast.success("Reviewer berhasil ditambahkan!");
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
          <DialogTitle>{reviewer ? "Edit Reviewer" : "Tambah Reviewer Baru"}</DialogTitle>
          <DialogDescription>
            {reviewer ? "Update informasi reviewer" : "Tambahkan reviewer baru ke sistem"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
                Password {!reviewer && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="col-span-3"
                placeholder={reviewer ? "Kosongkan jika tidak ingin mengubah" : ""}
                required={!reviewer}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="institusi" className="text-right">
                Institusi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="institusi"
                value={formData.institusi}
                onChange={(e) => setFormData({ ...formData, institusi: e.target.value })}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipe" className="text-right">
                Tipe <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tipe}
                onValueChange={(value) => setFormData({ ...formData, tipe: value as "INTERNAL" | "EKSTERNAL" })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                  <SelectItem value="EKSTERNAL">Eksternal</SelectItem>
                </SelectContent>
              </Select>
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
              {reviewer ? "Update" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
