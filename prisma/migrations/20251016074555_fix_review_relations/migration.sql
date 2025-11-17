/*
  Warnings:

  - You are about to drop the column `proposalId` on the `review` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `review_proposalId_fkey`;

-- DropIndex
DROP INDEX `review_proposalId_idx` ON `review`;

-- AlterTable
ALTER TABLE `review` DROP COLUMN `proposalId`;
