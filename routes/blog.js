const router = require('express').Router()
const ctrls = require('../controllers/blog')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../configs/cloudinaryConfig')

router.get('/', ctrls.getBlog)
router.get('/one/:bid', ctrls.getBlogById)
router.post('/', [verifyAccessToken, isAdmin], ctrls.createBlogNew)
router.put('/like/:bid', [verifyAccessToken], ctrls.likeBlog)
router.put('/image/:bid', [verifyAccessToken, isAdmin], uploader.single('images'), ctrls.uploadImageBlog)
router.put('/dislike/:bid', [verifyAccessToken], ctrls.disLikeBlog)
router.put('/update/:bid', [verifyAccessToken, isAdmin], ctrls.updateBlog)
router.delete('/:bid', [verifyAccessToken, isAdmin], ctrls.deleteBlog)

module.exports = router;