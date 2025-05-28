const mysql = require('mysql2/promise')
require('dotenv').config()

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'vocabulary_map',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

// 创建连接池
const pool = mysql.createPool(dbConfig)

// 测试连接
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('Database connection successful!')
    connection.release()
  } catch (error) {
    console.error('Error connecting to the database:', error.message)
    process.exit(1)
  }
}

// 执行SQL查询的辅助函数
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error('Error executing query:', error.message)
    throw error
  }
}

module.exports = {
  pool,
  query,
  testConnection
}
