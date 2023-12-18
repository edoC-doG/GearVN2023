const router = require('express').Router()
const ctrls = require('../controllers/products')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken, isAdmin], ctrls.createProduct);
router.put('/ratings', [verifyAccessToken], ctrls.ratings);
router.get('/', ctrls.getProducts)


router.delete('/:pid', [verifyAccessToken, isAdmin], ctrls.deleteProduct)
router.put('/:pid', [verifyAccessToken, isAdmin], ctrls.updateProduct)
router.get('/:pid', ctrls.getProduct)

module.exports = router;
