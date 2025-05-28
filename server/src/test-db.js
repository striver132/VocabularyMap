const path = require('path')
const fs = require('fs')
const config = require('./config')
const { testConnection, query } = config.db

// 检查环境设置
function checkEnvironment() {
  console.log('正在检查环境配置...')
  
  // 检查 .env 文件
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) {
    throw new Error('.env 文件不存在，请确保它在 server 目录下')
  }
  console.log('✓ .env 文件已找到')

  // 检查环境变量
  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']
  const missing = requiredEnvVars.filter(v => !process.env[v])
  if (missing.length > 0) {
    throw new Error(`缺少必需的环境变量: ${missing.join(', ')}`)
  }
  console.log('✓ 所有必需的环境变量都已设置')
}

async function testDatabase() {
  try {
    // 检查环境设置
    checkEnvironment()
    
    console.log('\n正在测试数据库连接...')
    // 测试数据库连接
    await testConnection()

    console.log('\n正在测试数据库查询...')
    // 测试查询 words 表
    const words = await query('SELECT * FROM words LIMIT 2')
    console.log('\n获取到的单词数据:')
    console.table(words)

    // 测试查询 synonyms 表
    const synonyms = await query('SELECT * FROM synonyms LIMIT 2')
    console.log('\n获取到的同义词数据:')
    console.table(synonyms)

    // 测试查询 antonyms 表
    const antonyms = await query('SELECT * FROM antonyms LIMIT 2')
    console.log('\n获取到的反义词数据:')
    console.table(antonyms)

    console.log('\n✅ 所有测试通过！数据库连接和表结构正常。')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message)
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('提示：请确保已经运行了 schema.sql 创建数据库表')
    }
    process.exit(1)
  }
}

// 运行测试
console.log('数据库连接测试开始...\n')
testDatabase() 