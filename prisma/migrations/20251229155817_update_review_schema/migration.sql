/*
  Warnings:

  - You are about to drop the column `danaDiajukan` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `nilaiKriteria1` on the `review` table. All the data in the column will be lost.
  - You are about to drop the column `nilaiKriteria2` on the `review` table. All the data in the column will be lost.
  - You are about to drop the column `nilaiKriteria3` on the `review` table. All the data in the column will be lost.
  - You are about to drop the column `nilaiKriteria4` on the `review` table. All the data in the column will be lost.
  - You are about to alter the column `nilaiTotal` on the `review` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Int`.

*/
-- AlterTable
ALTER TABLE `proposal` DROP COLUMN `danaDiajukan`,
    ADD COLUMN `danaDisetujui` DECIMAL(15, 2) NULL;

-- AlterTable
ALTER TABLE `review` DROP COLUMN `nilaiKriteria1`,
    DROP COLUMN `nilaiKriteria2`,
    DROP COLUMN `nilaiKriteria3`,
    DROP COLUMN `nilaiKriteria4`,
    ADD COLUMN `filePenilaian` VARCHAR(191) NULL,
    MODIFY `nilaiTotal` INTEGER NOT NULL;
