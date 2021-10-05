/*
  Warnings:

  - You are about to drop the `call` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `callsusers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `callsusers` DROP FOREIGN KEY `CallsUsers_callId_fkey`;

-- DropForeignKey
ALTER TABLE `callsusers` DROP FOREIGN KEY `CallsUsers_userId_fkey`;

-- DropTable
DROP TABLE `call`;

-- DropTable
DROP TABLE `callsusers`;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL DEFAULT '',
    `name` VARCHAR(191) NOT NULL DEFAULT '',
    `discord_id` VARCHAR(191) NOT NULL DEFAULT '',

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_discord_id_key`(`discord_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calls` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `name` VARCHAR(191) NOT NULL DEFAULT '',
    `user_amount_limit` INTEGER NOT NULL DEFAULT 0,
    `cur_user_amount` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `call_user` (
    `callId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`callId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `call_user` ADD CONSTRAINT `call_user_callId_fkey` FOREIGN KEY (`callId`) REFERENCES `calls`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_user` ADD CONSTRAINT `call_user_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
