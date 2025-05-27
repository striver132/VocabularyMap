const express = require('express')
const cors = require('cors')
const axios = require('axios')
const app = express()
const port = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(express.json())

// Ollama API基础URL（替换为你的Ollama服务地址）
const OLLAMA_API_BASE = 'http://localhost:11434' // 默认Ollama本地服务端口

// GET /api/words/:word
app.get('/api/words/:word', async (req, res) => {
  try {
    const word = req.params.word.toLowerCase()
    if (!word || !/^[a-zA-Z]+$/.test(word)) {
      return res.status(400).json({ error: 'Invalid word' })
    }

    // 调用Ollama Chat API，获取流式响应
    const response = await axios.post(`${OLLAMA_API_BASE}/api/chat`, {
      model: 'deepseek-r1:1.5b',
      messages: [
        {
          role: 'user',
          content: `For the word "${word}", provide the information in JSON format: word, part_of_speech, definition, example_sentence, pronunciation, synonyms, antonyms. Only return a valid JSON object, do not include any explanation or markdown.`
        }
      ]
    }, { responseType: 'text' }) // 以文本方式接收

    // 拆分每一行，提取 message.content 拼接
    const lines = response.data.split('\n').filter(Boolean)
    let content = ''
    for (const line of lines) {
      try {
        const obj = JSON.parse(line)
        if (obj.message && obj.message.content) {
          content += obj.message.content
        }
      } catch (e) {
        // 跳过无法解析的行
      }
    }

    // 去除 markdown 代码块标记
    content = content.replace(/```(json)?/g, '').trim()

    // 只取最后一个 { ... } JSON 对象
    const match = content.match(/{[\s\S]*}/)
    if (!match) {
      return res.status(500).json({ error: '未找到有效的 JSON 内容', raw: content })
    }

    let wordData
    try {
      wordData = JSON.parse(match[0])
    } catch (e) {
      return res.status(500).json({ error: 'Ollama 返回内容不是有效的 JSON', raw: content })
    }
    res.status(200).json(wordData)
  } catch (error) {
    console.error('Error:', error.message)
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch word data' })
  }
})

// 启动服务器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})