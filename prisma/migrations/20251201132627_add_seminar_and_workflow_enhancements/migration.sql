-- AlterTable
ALTER TABLE `monitoring` ADD COLUMN `catatanFinal` TEXT NULL,
    ADD COLUMN `fileLaporanFinal` VARCHAR(191) NULL,
    ADD COLUMN `laporanFinal` TEXT NULL,
    ADD COLUMN `plagiarismeCheckedAt` DATETIME(3) NULL,
    ADD COLUMN `plagiarismeFile` VARCHAR(191) NULL,
    ADD COLUMN `plagiarismePercentage` DECIMAL(5, 2) NULL,
    ADD COLUMN `plagiarismeStatus` VARCHAR(191) NULL,
    ADD COLUMN `verifikasiFinalAt` DATETIME(3) NULL,
    ADD COLUMN `verifikasiFinalStatus` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `proposal` ADD COLUMN `catatanAdministrasi` TEXT NULL,
    ADD COLUMN `checkDaftarPustaka` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `checkJudul` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `checkKajianTerdahulu` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `checkKonsepTeori` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `checkLampiran` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `checkLatarBelakang` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `checkManfaat` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `checkMetodologi` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `checkRencanaPembahasan` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `checkRencanaPublikasi` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `checkRumusanMasalah` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `checkTinjauanPustaka` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `checkTujuan` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `checkWaktuPelaksanaan` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `checkedAdminAt` DATETIME(3) NULL,
    ADD COLUMN `checkedAdminBy` VARCHAR(191) NULL,
    ADD COLUMN `deadlineLuaran` DATETIME(3) NULL,
    ADD COLUMN `deadlineMonitoring1` DATETIME(3) NULL,
    ADD COLUMN `deadlineMonitoring2` DATETIME(3) NULL,
    ADD COLUMN `deadlineSeminarInternal` DATETIME(3) NULL,
    ADD COLUMN `deadlineSeminarProposal` DATETIME(3) NULL,
    ADD COLUMN `deadlineSeminarPublik` DATETIME(3) NULL,
    ADD COLUMN `statusAdministrasi` VARCHAR(191) NULL DEFAULT 'BELUM_DICEK',
    ADD COLUMN `tanggalMulai` DATETIME(3) NULL,
    ADD COLUMN `tanggalSelesai` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `seminar` (
    `id` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `jenis` VARCHAR(191) NOT NULL,
    `judul` VARCHAR(500) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `waktu` VARCHAR(20) NOT NULL,
    `tempat` VARCHAR(200) NOT NULL,
    `moderator` VARCHAR(200) NULL,
    `notulensi` TEXT NULL,
    `hasilKeputusan` TEXT NULL,
    `fileUndangan` VARCHAR(191) NULL,
    `fileMateri` VARCHAR(191) NULL,
    `fileDokumentasi` VARCHAR(191) NULL,
    `fileNotulensi` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'SCHEDULED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `seminar_proposalId_idx`(`proposalId`),
    INDEX `seminar_status_idx`(`status`),
    INDEX `seminar_jenis_idx`(`jenis`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seminar_peserta` (
    `id` VARCHAR(191) NOT NULL,
    `seminarId` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(200) NOT NULL,
    `institusi` VARCHAR(200) NULL,
    `email` VARCHAR(100) NULL,
    `jabatan` VARCHAR(100) NULL,
    `hadir` BOOLEAN NOT NULL DEFAULT false,
    `keterangan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `seminar_peserta_seminarId_idx`(`seminarId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `seminar` ADD CONSTRAINT `seminar_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `Proposal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seminar_peserta` ADD CONSTRAINT `seminar_peserta_seminarId_fkey` FOREIGN KEY (`seminarId`) REFERENCES `seminar`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
