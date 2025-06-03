const axios = require('axios')

const OLLAMA_API_BASE = 'http://localhost:11434' // 默认Ollama本地服务端口

async function fetchWordData(word) {
  // 校验参数
  if (!word || !/^[a-zA-Z]+$/.test(word)) {
    throw new Error('Invalid word')
  }

  try {
    // 检查 Ollama 服务是否在运行
    try {
      await axios.get(`${OLLAMA_API_BASE}/api/version`)
    } catch (error) {
      throw new Error('Ollama service is not running. Please start Ollama first.')
    }

    // 请求 Ollama API
    const response = await axios.post(`${OLLAMA_API_BASE}/api/chat`, {
      model: 'deepseek-r1:1.5b',
      messages: [
        {
          role: 'user',
          content: `For the word 【"${word}"】, provide the information in JSON format: word, part_of_speech, definition, example_sentence, pronunciation, synonyms, antonyms. Only return a valid JSON object, do not include any explanation or markdown.`
        }
      ]
    }, { 
      responseType: 'text',
      timeout: 30000 // 30秒超时
    })

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
        continue
      }
    }

    // 去除 markdown 代码块标记
    content = content.replace(/```(json)?/g, '').trim()

    // 只取最后一个 { ... } JSON 对象
    const match = content.match(/{[\s\S]*}/)
    if (!match) {
      const error = new Error('未找到有效的 JSON 内容')
      error.raw = content
      throw error
    }

    try {
      return JSON.parse(match[0])
    } catch (e) {
      const error = new Error('Ollama 返回内容不是有效的 JSON')
      error.raw = content
      throw error
    }
  } catch (error) {
    // 处理网络错误
    if (error.code === 'ECONNREFUSED') {
      throw new Error('无法连接到 Ollama 服务，请确保服务已启动')
    }
    // 处理超时
    if (error.code === 'ETIMEDOUT') {
      throw new Error('请求超时，请稍后重试')
    }
    // 其他错误
    throw error
  }
}

module.exports = { fetchWordData }
