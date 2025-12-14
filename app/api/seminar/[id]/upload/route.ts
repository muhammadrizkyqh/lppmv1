import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const seminarId = params.id;

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const field = formData.get("field") as string | null;

    if (!file || !field) {
      return NextResponse.json(
        { success: false, error: "File dan field harus diisi" },
        { status: 400 }
      );
    }

    // Validate field
    const validFields = ["materiPresentasi", "notulensi", "daftarHadir", "dokumentasi"];
    if (!validFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: "Field tidak valid" },
        { status: 400 }
      );
    }

    // Get seminar
    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId },
      include: { proposal: { include: { dosen: true } } },
    });

    if (!seminar) {
      return NextResponse.json(
        { success: false, error: "Seminar tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check permissions
    const isAdmin = user.role === "ADMIN";
    const isKetua = seminar.proposal.dosen.userId === user.id;

    if (!isAdmin && !isKetua) {
      return NextResponse.json(
        { success: false, error: "Tidak ada akses" },
        { status: 403 }
      );
    }

    // Admin-only fields
    if (!isAdmin && ["notulensi", "daftarHadir", "dokumentasi"].includes(field)) {
      return NextResponse.json(
        { success: false, error: "Hanya admin yang bisa upload dokumen ini" },
        { status: 403 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "seminar", seminarId);
    await mkdir(uploadDir, { recursive: true });

    // Generate filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `${field}-${timestamp}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Write file
    await writeFile(filepath, buffer);

    // Public URL
    const publicUrl = `/uploads/seminar/${seminarId}/${filename}`;

    // Update database
    const updateData: any = {};
    if (field === "materiPresentasi") {
      updateData.fileMateriPresentasi = publicUrl;
    } else if (field === "notulensi") {
      updateData.fileNotulensi = publicUrl;
    } else if (field === "daftarHadir") {
      updateData.fileDaftarHadir = publicUrl;
    } else if (field === "dokumentasi") {
      updateData.fileDokumentasi = publicUrl;
    }

    await prisma.seminar.update({
      where: { id: seminarId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "File berhasil diupload",
      data: { url: publicUrl },
    });
  } catch (error) {
    console.error("Upload seminar file error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
