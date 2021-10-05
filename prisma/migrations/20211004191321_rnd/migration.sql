/*
  Warnings:

  - You are about to drop the `calls` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `calls`;

-- CreateTable
CREATE TABLE `Call` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
