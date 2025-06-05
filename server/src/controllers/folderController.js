const Folder = require('../models/folder')
const File = require('../models/file')

class FolderController {
  // 创建文件夹
  static async create(req, res) {
    try {
      const { name } = req.body
      if (!name) {
        return res.status(400).json({ error: '文件夹名称不能为空' })
      }

      const folderId = await Folder.create(name)
      res.status(201).json({ id: folderId, name })
    } catch (error) {
      console.error('创建文件夹失败:', error)
      res.status(500).json({ error: '创建文件夹失败' })
    }
  }

  // 获取所有文件夹
  static async getAll(req, res) {
    try {
      const folders = await Folder.getAll()
      res.json(folders)
    } catch (error) {
      console.error('获取文件夹列表失败:', error)
      res.status(500).json({ error: '获取文件夹列表失败' })
    }
  }

  // 获取单个文件夹及其文件
  static async getOne(req, res) {
    try {
      const { id } = req.params
      const folder = await Folder.getById(id)
      
      if (!folder) {
        return res.status(404).json({ error: '文件夹不存在' })
      }

      res.json(folder)
    } catch (error) {
      console.error('获取文件夹详情失败:', error)
      res.status(500).json({ error: '获取文件夹详情失败' })
    }
  }

  // 更新文件夹
  static async update(req, res) {
    try {
      const { id } = req.params
      const { name } = req.body

      if (!name) {
        return res.status(400).json({ error: '文件夹名称不能为空' })
      }

      const success = await Folder.update(id, name)
      if (!success) {
        return res.status(404).json({ error: '文件夹不存在' })
      }

      res.json({ message: '文件夹更新成功' })
    } catch (error) {
      console.error('更新文件夹失败:', error)
      res.status(500).json({ error: '更新文件夹失败' })
    }
  }

  // 删除文件夹
  static async delete(req, res) {
    try {
      const { id } = req.params
      const success = await Folder.delete(id)
      
      if (!success) {
        return res.status(404).json({ error: '文件夹不存在' })
      }

      res.json({ message: '文件夹删除成功' })
    } catch (error) {
      console.error('删除文件夹失败:', error)
      res.status(500).json({ error: '删除文件夹失败' })
    }
  }
}

module.exports = FolderController