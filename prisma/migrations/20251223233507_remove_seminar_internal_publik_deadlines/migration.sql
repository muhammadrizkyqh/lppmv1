/*
  Warnings:

  - You are about to drop the column `deadlineSeminarInternal` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `deadlineSeminarPublik` on the `proposal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `proposal` DROP COLUMN `deadlineSeminarInternal`,
    DROP COLUMN `deadlineSeminarPublik`;
