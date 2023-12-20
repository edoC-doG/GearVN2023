const router = require('express').Router()
const ctrls = require('../controllers/coupon')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')


router.post('/', [verifyAccessToken, isAdmin], ctrls.createCoupons)
router.get('/', ctrls.getCoupons)
router.put('/:cid', [verifyAccessToken, isAdmin], ctrls.updateCoupons)
router.delete('/:cid', [verifyAccessToken, isAdmin], ctrls.deleteCoupons)
// router.post('/', [verifyAccessToken, isAdmin], ctrls.createBlogNew)
// router.put('/like/:bid', [verifyAccessToken], ctrls.likeBlog)
// router.put('/dislike/:bid', [verifyAccessToken], ctrls.disLikeBlog)
module.exports = router;