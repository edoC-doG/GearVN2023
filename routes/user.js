const router = require('express').Router()
const ctrls = require('../controllers/user')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../configs/cloudinaryConfig')


router.post('/register', ctrls.register);
router.post('/mock', ctrls.insertUsers);
router.post('/final-register/:token', ctrls.finalRegister);
router.post('/login', ctrls.login);
router.post('/refreshToken', ctrls.refreshAccessToken);
router.get('/logout', ctrls.logout);
router.post('/forgotPassword', ctrls.forgotPassword);
router.put('/resetPassword', ctrls.resetPwd);
router.delete('/:uid', [verifyAccessToken, isAdmin], ctrls.deleteUser)
router.get('/', [verifyAccessToken, isAdmin], ctrls.getUsers)
//Route For Admin
router.get('/current', verifyAccessToken, ctrls.getCurrentUser)
router.put('/current', verifyAccessToken, uploader.single('avatar'), ctrls.updateUser)
router.put('/address', [verifyAccessToken], ctrls.updateUserAdd)
router.put('/cart', [verifyAccessToken], ctrls.updateCartAdd)
router.put('/:uid', [verifyAccessToken, isAdmin], ctrls.updateUserByAdmin)


module.exports = router;    
