const express = require('express')
const router = express.Router()
const FolderController = require('../controllers/folderController')
const FileController = require('../controllers/fileController')

// 文件夹路由
router.post('/', FolderController.create)
router.get('/', FolderController.getAll)
router.get('/:id', FolderController.getOne)
router.put('/:id', FolderController.update)
router.delete('/:id', FolderController.delete)

// 文件路由
router.post('/:folderId/files', FileController.create)
router.get('/:folderId/files', FileController.getByFolder)
router.get('/files/:id', FileController.getOne)
router.put('/files/:id', FileController.update)
router.delete('/files/:id', FileController.delete)
router.put('/files/:id/move', FileController.move)

module.exports = router 