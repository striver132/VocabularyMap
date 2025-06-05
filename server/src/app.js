const express = require('express')
const cors = require('cors')
const { fetchWordData } = require('./services/ollamaService')
const wordRoutes = require('./routes/wordRoutes')

const folderRoutes = require('./routes/folders')

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// 注册路由

app.use('/api', wordRoutes)

app.use('/api/folders', folderRoutes)

// AI 查询路由
app.get('/api/ai/words/:word', async (req, res) => {
  try {
    const word = req.params.word.toLowerCase()
    const wordData = await fetchWordData(word)
    res.status(200).json(wordData)
  } catch (error) {
    if (error.message === 'Invalid word') {
      return res.status(400).json({ error: 'Invalid word' })
    }
    if (error.raw) {
      return res.status(500).json({ error: error.message, raw: error.raw })
    }
    res.status(500).json({ error: 'Failed to fetch word data' })
  }
})

// 只在直接运行时启动服务器（不是被 require 时）
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: '服务器内部错误' })
})

module.exports = app
