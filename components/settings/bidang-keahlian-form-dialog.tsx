"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { bidangKeahlianApi, type BidangKeahlian } from "@/lib/api-client"
import { toast } from "sonner"

interface BidangKeahlianFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bidangKeahlian?: BidangKeahlian | null
  onSuccess: () => void
}

export function BidangKeahlianFormDialog({
  open,
  onOpenChange,
  bidangKeahlian,
  onSuccess,
}: BidangKeahlianFormDialogProps) {
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    status: "AKTIF" as "AKTIF" | "NONAKTIF",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (bidangKeahlian) {
      setFormData({
        nama: bidangKeahlian.nama,
        deskripsi: bidangKeahlian.deskripsi || "",
        status: bidangKeahlian.status as "AKTIF" | "NONAKTIF",
      })
    } else {
      setFormData({
        nama: "",
        deskripsi: "",
        status: "AKTIF",
      })
    }
  }, [bidangKeahlian, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        nama: formData.nama,
        deskripsi: formData.deskripsi || undefined,
        status: formData.status,
      }

      if (bidangKeahlian) {
        await bidangKeahlianApi.update(bidangKeahlian.id, data)
        toast.success("Bidang keahlian berhasil diupdate!")
      } else {
        await bidangKeahlianApi.create(data)
        toast.success("Bidang keahlian berhasil ditambahkan!")
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{bidangKeahlian ? "Edit Bidang Keahlian" : "Tambah Bidang Keahlian"}</DialogTitle>
            <DialogDescription>
              {bidangKeahlian ? "Update data bidang keahlian" : "Tambah bidang keahlian baru"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nama" className="text-right">
                Nama
              </Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="col-span-3"
                placeholder="Pendidikan Bahasa Arab"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deskripsi" className="text-right">
                Deskripsi
              </Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="col-span-3"
                placeholder="Deskripsi bidang keahlian"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: "AKTIF" | "NONAKTIF") => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AKTIF">Aktif</SelectItem>
                  <SelectItem value="NONAKTIF">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : bidangKeahlian ? "Update" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
