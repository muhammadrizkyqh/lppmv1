-- CreateTable
CREATE TABLE `pencairan_dana` (
    `id` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `termin` ENUM('TERMIN_1', 'TERMIN_2', 'TERMIN_3') NOT NULL,
    `nominal` DECIMAL(15, 2) NOT NULL,
    `persentase` DECIMAL(5, 2) NOT NULL,
    `tanggalPencairan` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'DICAIRKAN', 'DITOLAK') NOT NULL DEFAULT 'PENDING',
    `keterangan` TEXT NULL,
    `fileBukti` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `pencairan_dana_proposalId_idx`(`proposalId`),
    INDEX `pencairan_dana_status_idx`(`status`),
    INDEX `pencairan_dana_termin_idx`(`termin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pencairan_dana` ADD CONSTRAINT `pencairan_dana_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `Proposal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pencairan_dana` ADD CONSTRAINT `pencairan_dana_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
