const { query, pool } = require('../config').db

class File {
  // 创建文件
  static async create(name, description, folderId) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO files (name, description, folder_id) VALUES (?, ?, ?)',
        [name, description, folderId]
      )
      return result.insertId
    } catch (error) {
      throw error
    }
  }

  // 获取文件夹中的所有文件
  static async getByFolderId(folderId) {
    try {
      const [files] = await pool.execute(
        'SELECT * FROM files WHERE folder_id = ? ORDER BY created_at DESC',
        [folderId]
      )
      return files
    } catch (error) {
      throw error
    }
  }

  // 获取单个文件
  static async getById(id) {
    try {
      const [files] = await pool.execute('SELECT * FROM files WHERE id = ?', [id])
      return files.length > 0 ? files[0] : null
    } catch (error) {
      throw error
    }
  }

  // 更新文件
  static async update(id, name, description) {
    try {
      const [result] = await pool.execute(
        'UPDATE files SET name = ?, description = ? WHERE id = ?',
        [name, description, id]
      )
      return result.affectedRows > 0
    } catch (error) {
      throw error
    }
  }

  // 删除文件
  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM files WHERE id = ?', [id])
      return result.affectedRows > 0
    } catch (error) {
      throw error
    }
  }

  // 移动文件到其他文件夹
  static async move(id, newFolderId) {
    try {
      const [result] = await pool.execute(
        'UPDATE files SET folder_id = ? WHERE id = ?',
        [newFolderId, id]
      )
      return result.affectedRows > 0
    } catch (error) {
      throw error
    }
  }
}

module.exports = File 