const WordModel = require('../models/wordModel')

class WordController {
  // 创建新单词
  static async createWord(req, res) {
    try {
      const wordData = req.body
      
      // 验证必需的字段
      if (!wordData.word || !wordData.part_of_speech || !wordData.definition) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'Word, part of speech, and definition are required'
        })
      }

      // 检查单词是否已存在
      const existingWord = await WordModel.getByWord(wordData.word.toLowerCase())
      if (existingWord) {
        return res.status(409).json({
          error: 'Word already exists',
          details: `The word "${wordData.word}" already exists in the database`
        })
      }

      const word = await WordModel.create(wordData)
      res.status(201).json(word)
    } catch (error) {
      console.error('Error creating word:', error)
      res.status(500).json({
        error: 'Failed to create word',
        details: error.message
      })
    }
  }

  // 获取单个单词
  static async getWord(req, res) {
    try {
      const word = await WordModel.getByWord(req.params.word.toLowerCase())
      if (!word) {
        return res.status(404).json({ error: 'Word not found' })
      }
      res.json(word)
    } catch (error) {
      console.error('Error fetching word:', error)
      res.status(500).json({ error: 'Failed to fetch word' })
    }
  }

  // 获取所有单词
  static async getAllWords(req, res) {
    try {
      const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10))
      const offset = Math.max(0, parseInt(req.query.offset) || 0)
      
      const result = await WordModel.getAll(limit, offset)
      res.json({
        total: result.total,
        limit,
        offset,
        data: result.words
      })
    } catch (error) {
      console.error('Error fetching words:', error)
      res.status(500).json({
        error: 'Failed to fetch words',
        details: error.message
      })
    }
  }

  // 更新单词
  static async updateWord(req, res) {
    try {
      const wordData = req.body
      const word = await WordModel.getByWord(req.params.word.toLowerCase())
      if (!word) {
        return res.status(404).json({ error: 'Word not found' })
      }
      const updatedWord = await WordModel.update(word.id, wordData)
      res.json(updatedWord)
    } catch (error) {
      console.error('Error updating word:', error)
      res.status(500).json({ error: 'Failed to update word' })
    }
  }

  // 删除单词
  static async deleteWord(req, res) {
    try {
      const word = await WordModel.getByWord(req.params.word.toLowerCase())
      if (!word) {
        return res.status(404).json({ error: 'Word not found' })
      }
      await WordModel.delete(word.id)
      res.status(204).send()
    } catch (error) {
      console.error('Error deleting word:', error)
      res.status(500).json({ error: 'Failed to delete word' })
    }
  }

  // 搜索单词
  static async searchWords(req, res) {
    try {
      const keyword = req.query.q || ''
      const limit = parseInt(req.query.limit) || 10
      const words = await WordModel.search(keyword, limit)
      res.json(words)
    } catch (error) {
      console.error('Error searching words:', error)
      res.status(500).json({ error: 'Failed to search words' })
    }
  }
}

module.exports = WordController
