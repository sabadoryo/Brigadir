-- AlterTable
ALTER TABLE `call` ADD COLUMN `cur_user_amount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `name` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `user_amount_limit` INTEGER NOT NULL DEFAULT 0;
