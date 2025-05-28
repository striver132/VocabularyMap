require('dotenv').config()

module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  // Ollama API配置
  ollama: {
    baseUrl: process.env.OLLAMA_API_BASE || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b'
  },

  // 导出数据库配置
  db: require('./database')
}
