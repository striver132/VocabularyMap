const File = require('../models/file')
const Folder = require('../models/folder')

class FileController {
  // 创建文件
  static async create(req, res) {
    try {
      const { name, description, folderId } = req.body
      if (!name || !folderId) {
        return res.status(400).json({ error: '文件名和文件夹ID不能为空' })
      }

      // 检查文件夹是否存在
      const folder = await Folder.getById(folderId)
      if (!folder) {
        return res.status(404).json({ error: '文件夹不存在' })
      }

      const fileId = await File.create(name, description, folderId)
      res.status(201).json({ id: fileId, name, description, folderId })
    } catch (error) {
      console.error('创建文件失败:', error)
      res.status(500).json({ error: '创建文件失败' })
    }
  }

  // 获取文件夹中的所有文件
  static async getByFolder(req, res) {
    try {
      const { folderId } = req.params
      const files = await File.getByFolderId(folderId)
      res.json(files)
    } catch (error) {
      console.error('获取文件列表失败:', error)
      res.status(500).json({ error: '获取文件列表失败' })
    }
  }

  // 获取单个文件
  static async getOne(req, res) {
    try {
      const { id } = req.params
      const file = await File.getById(id)
      
      if (!file) {
        return res.status(404).json({ error: '文件不存在' })
      }

      res.json(file)
    } catch (error) {
      console.error('获取文件详情失败:', error)
      res.status(500).json({ error: '获取文件详情失败' })
    }
  }

  // 更新文件
  static async update(req, res) {
    try {
      const { id } = req.params
      const { name } = req.body

      if (!name) {
        return res.status(400).json({ error: '文件名不能为空' })
      }

      const success = await File.update(id, name)
      if (!success) {
        return res.status(404).json({ error: '文件不存在' })
      }

      res.json({ message: '文件更新成功' })
    } catch (error) {
      console.error('更新文件失败:', error)
      res.status(500).json({ error: '更新文件失败' })
    }
  }

  // 删除文件
  static async delete(req, res) {
    try {
      const { id } = req.params
      const success = await File.delete(id)
      
      if (!success) {
        return res.status(404).json({ error: '文件不存在' })
      }

      res.json({ message: '文件删除成功' })
    } catch (error) {
      console.error('删除文件失败:', error)
      res.status(500).json({ error: '删除文件失败' })
    }
  }

  // 移动文件到其他文件夹
  static async move(req, res) {
    try {
      const { id } = req.params
      const { newFolderId } = req.body

      if (!newFolderId) {
        return res.status(400).json({ error: '新文件夹ID不能为空' })
      }

      // 检查新文件夹是否存在
      const folder = await Folder.getById(newFolderId)
      if (!folder) {
        return res.status(404).json({ error: '目标文件夹不存在' })
      }

      const success = await File.move(id, newFolderId)
      if (!success) {
        return res.status(404).json({ error: '文件不存在' })
      }

      res.json({ message: '文件移动成功' })
    } catch (error) {
      console.error('移动文件失败:', error)
      res.status(500).json({ error: '移动文件失败' })
    }
  }
}

module.exports = FileController 