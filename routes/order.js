const router = require('express').Router()
const ctrls = require('../controllers/order')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')


router.post('/', verifyAccessToken, ctrls.createOrderNew)
router.get('/', verifyAccessToken, ctrls.getUserOrder)
router.put('/status/:oid', verifyAccessToken, isAdmin, ctrls.updateStatusOrder)
router.get('/admin', verifyAccessToken, isAdmin, ctrls.getUserOrderByAdmin)


module.exports = router;