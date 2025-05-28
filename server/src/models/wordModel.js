const { query, pool } = require('../config').db

class WordModel {
  // 创建新单词
  static async create(wordData) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 1. 插入单词基本信息
      const [result] = await connection.execute(
        'INSERT INTO words (word, part_of_speech, definition, example_sentence, pronunciation) VALUES (?, ?, ?, ?, ?)',
        [wordData.word, wordData.part_of_speech, wordData.definition, wordData.example_sentence, wordData.pronunciation]
      )
      const wordId = result.insertId

      // 2. 插入同义词
      if (wordData.synonyms && wordData.synonyms.length > 0) {
        const synonymValues = wordData.synonyms.map(s => [wordId, s])
        await connection.query(
          'INSERT INTO synonyms (word_id, synonym_word) VALUES ?',
          [synonymValues]
        )
      }

      // 3. 插入反义词
      if (wordData.antonyms && wordData.antonyms.length > 0) {
        const antonymValues = wordData.antonyms.map(a => [wordId, a])
        await connection.query(
          'INSERT INTO antonyms (word_id, antonym_word) VALUES ?',
          [antonymValues]
        )
      }

      await connection.commit()
      
      // 获取完整的单词信息
      const word = await this.getById(wordId)
      if (!word) {
        throw new Error('Failed to retrieve created word')
      }
      return word

    } catch (error) {
      await connection.rollback()
      console.error('Error in create word:', error)
      throw new Error(error.message || 'Failed to create word')
    } finally {
      connection.release()
    }
  }

  // 获取单个单词的完整信息
  static async getById(id) {
    try {
      // 1. 获取单词基本信息
      const [word] = await query('SELECT * FROM words WHERE id = ?', [id])
      if (!word) return null

      // 2. 获取同义词
      const synonyms = await query(
        'SELECT synonym_word FROM synonyms WHERE word_id = ?',
        [id]
      )
      word.synonyms = synonyms.map(s => s.synonym_word)

      // 3. 获取反义词
      const antonyms = await query(
        'SELECT antonym_word FROM antonyms WHERE word_id = ?',
        [id]
      )
      word.antonyms = antonyms.map(a => a.antonym_word)

      return word
    } catch (error) {
      throw error
    }
  }

  // 根据单词文本获取信息
  static async getByWord(word) {
    try {
      const [wordData] = await query('SELECT * FROM words WHERE word = ?', [word])
      if (!wordData) return null
      return this.getById(wordData.id)
    } catch (error) {
      throw error
    }
  }

  // 获取单词总数
  static async getTotal() {
    try {
      const [result] = await pool.query('SELECT COUNT(*) as total FROM words')
      return result[0].total
    } catch (error) {
      console.error('Error getting total count:', error)
      throw new Error('Failed to get total word count')
    }
  }

  // 获取所有单词
  static async getAll(limit = 10, offset = 0) {
    try {
      // 确保参数是数字类型
      const safeLimit = Number(limit)
      const safeOffset = Number(offset)
      
      // 获取总数
      const total = await this.getTotal()
      
      // 如果没有数据，直接返回
      if (total === 0) {
        return {
          total: 0,
          words: []
        }
      }
      
      // 获取所有单词的基本信息
      const [words] = await pool.query(
        'SELECT * FROM words ORDER BY word LIMIT ? OFFSET ?',
        [safeLimit, safeOffset]
      )
      
      // 获取每个单词的完整信息（包括同义词和反义词）
      const wordsWithRelations = await Promise.all(
        words.map(async word => {
          // 获取同义词
          const [synonyms] = await pool.query(
            'SELECT synonym_word FROM synonyms WHERE word_id = ?',
            [word.id]
          )
          
          // 获取反义词
          const [antonyms] = await pool.query(
            'SELECT antonym_word FROM antonyms WHERE word_id = ?',
            [word.id]
          )
          
          return {
            ...word,
            synonyms: synonyms.map(s => s.synonym_word),
            antonyms: antonyms.map(a => a.antonym_word)
          }
        })
      )
      
      return {
        total,
        words: wordsWithRelations
      }
    } catch (error) {
      console.error('Error in getAll:', error)
      throw new Error('Failed to fetch words')
    }
  }

  // 更新单词信息
  static async update(id, wordData) {
    try {
      // 1. 更新单词基本信息
      await query(
        'UPDATE words SET word = ?, part_of_speech = ?, definition = ?, example_sentence = ?, pronunciation = ? WHERE id = ?',
        [wordData.word, wordData.part_of_speech, wordData.definition, wordData.example_sentence, wordData.pronunciation, id]
      )

      // 2. 更新同义词（先删除旧的，再插入新的）
      if (wordData.synonyms) {
        await query('DELETE FROM synonyms WHERE word_id = ?', [id])
        if (wordData.synonyms.length > 0) {
          const synonymValues = wordData.synonyms.map(s => [id, s])
          await query(
            'INSERT INTO synonyms (word_id, synonym_word) VALUES ?',
            [synonymValues]
          )
        }
      }

      // 3. 更新反义词（先删除旧的，再插入新的）
      if (wordData.antonyms) {
        await query('DELETE FROM antonyms WHERE word_id = ?', [id])
        if (wordData.antonyms.length > 0) {
          const antonymValues = wordData.antonyms.map(a => [id, a])
          await query(
            'INSERT INTO antonyms (word_id, antonym_word) VALUES ?',
            [antonymValues]
          )
        }
      }

      return this.getById(id)
    } catch (error) {
      throw error
    }
  }

  // 删除单词
  static async delete(id) {
    try {
      // 由于设置了外键约束和 CASCADE，同义词和反义词会自动删除
      const result = await query('DELETE FROM words WHERE id = ?', [id])
      return result.affectedRows > 0
    } catch (error) {
      throw error
    }
  }

  // 搜索单词
  static async search(keyword, limit = 10) {
    try {
      const words = await query(
        'SELECT * FROM words WHERE word LIKE ? LIMIT ?',
        [`%${keyword}%`, limit]
      )
      return Promise.all(words.map(word => this.getById(word.id)))
    } catch (error) {
      throw error
    }
  }
}

module.exports = WordModel
