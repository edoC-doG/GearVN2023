const router = require('express').Router()
const ctrls = require('../controllers/brand')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken, isAdmin], ctrls.createBrand);
router.get('/', ctrls.getBrand);
router.put('/:pcid', [verifyAccessToken, isAdmin], ctrls.updateBrand);
router.delete('/:pcid', [verifyAccessToken, isAdmin], ctrls.deleteBrand);


module.exports = router;
