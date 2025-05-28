-- 创建数据库
CREATE DATABASE IF NOT EXISTS vocabulary_map;
USE vocabulary_map;

-- 单词表
CREATE TABLE IF NOT EXISTS words (
    id INT PRIMARY KEY AUTO_INCREMENT,
    word VARCHAR(50) NOT NULL UNIQUE,
    part_of_speech VARCHAR(50),
    definition TEXT,
    example_sentence TEXT,
    pronunciation VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_word (word)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 同义词关系表
CREATE TABLE IF NOT EXISTS synonyms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    word_id INT NOT NULL,
    synonym_word VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    UNIQUE KEY unique_synonym (word_id, synonym_word)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 反义词关系表
CREATE TABLE IF NOT EXISTS antonyms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    word_id INT NOT NULL,
    antonym_word VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    UNIQUE KEY unique_antonym (word_id, antonym_word)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建示例数据
INSERT INTO words (word, part_of_speech, definition, example_sentence, pronunciation) VALUES
('beautiful', 'adjective', 'pleasing the senses or mind aesthetically', 'She looked beautiful in her wedding dress.', 'bjuːtɪfl'),
('happy', 'adjective', 'feeling or showing pleasure or contentment', 'I am happy to see you.', 'hæpi');

-- 插入同义词示例
INSERT INTO synonyms (word_id, synonym_word) VALUES
((SELECT id FROM words WHERE word = 'beautiful'), 'pretty'),
((SELECT id FROM words WHERE word = 'beautiful'), 'gorgeous'),
((SELECT id FROM words WHERE word = 'happy'), 'joyful'),
((SELECT id FROM words WHERE word = 'happy'), 'glad');

-- 插入反义词示例
INSERT INTO antonyms (word_id, antonym_word) VALUES
((SELECT id FROM words WHERE word = 'beautiful'), 'ugly'),
((SELECT id FROM words WHERE word = 'happy'), 'sad'); 