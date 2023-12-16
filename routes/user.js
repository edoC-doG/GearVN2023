const router = require('express').Router()
const ctrls = require('../controllers/user')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/register', ctrls.register);
router.post('/login', ctrls.login);
router.post('/refreshToken', ctrls.refreshAccessToken);
router.get('/logout', ctrls.logout);
router.get('/forgotPassword', ctrls.forgotPassword);
router.put('/resetPassword', ctrls.resetPwd);

//Route For Admin
router.get('/', [verifyAccessToken, isAdmin], ctrls.getUsers)
router.put('/:uid', [verifyAccessToken, isAdmin], ctrls.updateUserByAdmin)
router.delete('/', [verifyAccessToken, isAdmin], ctrls.deleteUser)

router.get('/current', verifyAccessToken, ctrls.getCurrentUser);
router.put('/current', [verifyAccessToken], ctrls.updateUser)

module.exports = router;
