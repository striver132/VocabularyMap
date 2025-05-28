const express = require('express')
const router = express.Router()
const WordController = require('../controllers/wordController')

// 获取所有单词
router.get('/words', WordController.getAllWords)

// 搜索单词
router.get('/words/search', WordController.searchWords)

// 创建新单词
router.post('/words', WordController.createWord)

// 获取单个单词
router.get('/words/:word', WordController.getWord)

// 更新单词
router.put('/words/:word', WordController.updateWord)

// 删除单词
router.delete('/words/:word', WordController.deleteWord)

module.exports = router
