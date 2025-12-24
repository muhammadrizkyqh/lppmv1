/*
  Warnings:

  - You are about to drop the column `checkDaftarPustaka` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `checkJudul` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `checkKajianTerdahulu` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `checkKonsepTeori` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `checkLampiran` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `checkLatarBelakang` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `checkManfaat` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `checkMetodologi` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `checkRencanaPembahasan` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `checkRencanaPublikasi` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `checkRumusanMasalah` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `checkTinjauanPustaka` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `checkTujuan` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `checkWaktuPelaksanaan` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `dana` on the `skema` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `proposal` DROP COLUMN `checkDaftarPustaka`,
    DROP COLUMN `checkJudul`,
    DROP COLUMN `checkKajianTerdahulu`,
    DROP COLUMN `checkKonsepTeori`,
    DROP COLUMN `checkLampiran`,
    DROP COLUMN `checkLatarBelakang`,
    DROP COLUMN `checkManfaat`,
    DROP COLUMN `checkMetodologi`,
    DROP COLUMN `checkRencanaPembahasan`,
    DROP COLUMN `checkRencanaPublikasi`,
    DROP COLUMN `checkRumusanMasalah`,
    DROP COLUMN `checkTinjauanPustaka`,
    DROP COLUMN `checkTujuan`,
    DROP COLUMN `checkWaktuPelaksanaan`,
    ADD COLUMN `catatanKelengkapanKomponen` TEXT NULL,
    ADD COLUMN `catatanKesesuaianTeknikPenulisan` TEXT NULL,
    ADD COLUMN `checkKelengkapanKomponen` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `checkKesesuaianTeknikPenulisan` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `danaDiajukan` DECIMAL(15, 2) NULL,
    MODIFY `status` ENUM('DRAFT', 'DIAJUKAN', 'LULUS_ADMINISTRATIF', 'DIREVIEW', 'REVISI', 'DITERIMA', 'DITOLAK', 'BERJALAN', 'SELESAI') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `seminar` ADD COLUMN `keterangan` TEXT NULL,
    ADD COLUMN `linkOnline` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `skema` DROP COLUMN `dana`;
