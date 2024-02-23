const router = require('express').Router()
const ctrls = require('../controllers/insertData')

router.post('/', ctrls.insertData);
router.post('/cate', ctrls.insertCateProduct);

module.exports = router;
