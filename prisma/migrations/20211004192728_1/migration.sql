-- CreateTable
CREATE TABLE `CallsUsers` (
    `callId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`callId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CallsUsers` ADD CONSTRAINT `CallsUsers_callId_fkey` FOREIGN KEY (`callId`) REFERENCES `Call`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CallsUsers` ADD CONSTRAINT `CallsUsers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
