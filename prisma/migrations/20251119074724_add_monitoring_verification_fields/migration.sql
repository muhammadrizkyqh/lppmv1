-- AlterTable
ALTER TABLE `monitoring` ADD COLUMN `catatanAkhir` TEXT NULL,
    ADD COLUMN `catatanKemajuan` TEXT NULL,
    ADD COLUMN `verifikasiAkhirAt` DATETIME(3) NULL,
    ADD COLUMN `verifikasiAkhirStatus` VARCHAR(191) NULL,
    ADD COLUMN `verifikasiKemajuanAt` DATETIME(3) NULL,
    ADD COLUMN `verifikasiKemajuanStatus` VARCHAR(191) NULL;
