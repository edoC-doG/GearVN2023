const router = require('express').Router()
const ctrls = require('../controllers/products')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../configs/cloudinaryConfig')

router.post('/', [verifyAccessToken, isAdmin], ctrls.createProduct);
router.put('/ratings', [verifyAccessToken], ctrls.ratings);
router.get('/', ctrls.getProducts)


router.delete('/:pid', [verifyAccessToken, isAdmin], ctrls.deleteProduct)
router.put('/:pid', [verifyAccessToken, isAdmin], ctrls.updateProduct)
router.put('/uploadimage/:pid', [verifyAccessToken, isAdmin], uploader.array('images', 10), ctrls.uploadImageProd)
router.get('/:pid', ctrls.getProduct)

module.exports = router;
