-- CreateTable
CREATE TABLE `luaran` (
    `id` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `jenis` ENUM('JURNAL', 'BUKU', 'HAKI', 'PRODUK', 'MEDIA_MASSA', 'LAINNYA') NOT NULL,
    `judul` VARCHAR(500) NOT NULL,
    `penerbit` VARCHAR(200) NULL,
    `tahunTerbit` INTEGER NULL,
    `url` VARCHAR(500) NULL,
    `fileBukti` VARCHAR(191) NULL,
    `keterangan` TEXT NULL,
    `tanggalUpload` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `statusVerifikasi` ENUM('PENDING', 'DIVERIFIKASI', 'DITOLAK') NOT NULL DEFAULT 'PENDING',
    `catatanVerifikasi` TEXT NULL,
    `verifiedBy` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `luaran_proposalId_idx`(`proposalId`),
    INDEX `luaran_statusVerifikasi_idx`(`statusVerifikasi`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `luaran` ADD CONSTRAINT `luaran_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `Proposal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `luaran` ADD CONSTRAINT `luaran_verifiedBy_fkey` FOREIGN KEY (`verifiedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
