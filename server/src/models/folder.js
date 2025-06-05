const { query, pool } = require('../config').db


class Folder {
  // 创建文件夹
  static async create(name) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO folders (name) VALUES (?)',
        [name]
      )
      return result.insertId
    } catch (error) {
      throw error
    }
  }

  // 获取所有文件夹
  static async getAll() {
    try {
      const [folders] = await pool.execute('SELECT * FROM folders ORDER BY created_at DESC')
      return folders
    } catch (error) {
      throw error
    }
  }

  // 获取单个文件夹及其文件
  static async getById(id) {
    try {
      const [folders] = await pool.execute('SELECT * FROM folders WHERE id = ?', [id])
      if (folders.length === 0) {
        return null
      }
      
      // 获取文件夹中的文件
      const [files] = await pool.execute(
        'SELECT * FROM files WHERE folder_id = ? ORDER BY created_at DESC',
        [id]
      )
      
      return {
        ...folders[0],
        files
      }
    } catch (error) {
      throw error
    }
  }

  // 更新文件夹
  static async update(id, name) {
    try {
      const [result] = await pool.execute(
        'UPDATE folders SET name = ? WHERE id = ?',
        [name, id]
      )
      return result.affectedRows > 0
    } catch (error) {
      throw error
    }
  }

  // 删除文件夹
  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM folders WHERE id = ?', [id])
      return result.affectedRows > 0
    } catch (error) {
      throw error
    }
  }
}

module.exports = Folder