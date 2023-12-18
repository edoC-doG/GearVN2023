const router = require('express').Router()
const ctrls = require('../controllers/blogCategory')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken, isAdmin], ctrls.createBlogCategory);
router.get('/', ctrls.getBlogCategory);
router.put('/:pcid', [verifyAccessToken, isAdmin], ctrls.updateBlogCategory);
router.delete('/:pcid', [verifyAccessToken, isAdmin], ctrls.deleteBlogCategory);


module.exports = router;
