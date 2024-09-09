-- CreateTable
CREATE TABLE `words` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `word` VARCHAR(191) NOT NULL,
    `translation` VARCHAR(191) NOT NULL,
    `word_category_id` INTEGER NULL,
    `english_example` VARCHAR(191) NULL,
    `portuguese_example` VARCHAR(191) NULL,
    `portuguese_context` VARCHAR(191) NULL,

    UNIQUE INDEX `words_word_key`(`word`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `word_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wordstudy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `words_id` INTEGER NULL,
    `customer_id` VARCHAR(191) NULL,
    `repetitions` INTEGER NOT NULL DEFAULT 0,
    `previous_interval` INTEGER NOT NULL DEFAULT 0,
    `previous_ease_factor` DOUBLE NOT NULL DEFAULT 2.5,
    `review_date` DATETIME(3) NULL,
    `status` ENUM('NEW', 'STUDYING', 'LEARNED') NOT NULL DEFAULT 'NEW',

    UNIQUE INDEX `wordstudy_words_id_customer_id_key`(`words_id`, `customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `words` ADD CONSTRAINT `words_word_category_id_fkey` FOREIGN KEY (`word_category_id`) REFERENCES `word_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wordstudy` ADD CONSTRAINT `wordstudy_words_id_fkey` FOREIGN KEY (`words_id`) REFERENCES `words`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wordstudy` ADD CONSTRAINT `wordstudy_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
