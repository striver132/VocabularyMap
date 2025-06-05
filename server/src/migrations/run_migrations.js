const fs = require('fs')
const path = require('path')
const { pool } = require('../config').db

async function runMigrations() {
  try {
    // 读取所有 SQL 文件
    const files = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.sql'))
      .sort()

    for (const file of files) {
      console.log(`Running migration: ${file}`)
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8')
      
      try {
        await pool.query(sql)
        console.log(`Successfully ran migration: ${file}`)
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column already exists in migration: ${file}`)
        } else {
          throw error
        }
      }
    }

    console.log('All migrations completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error running migrations:', error)
    process.exit(1)
  }
}

runMigrations() 