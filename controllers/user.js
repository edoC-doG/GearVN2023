const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const sendMail = require('../utils/sendMail')
const crypto = require('crypto');
const makeToken = require('uniqid')
const { users } = require('../utils/mockDataUser')

// const register = asyncHandler(async (req, res) => {
//     const { email, password, firstName, lastName, mobile } = req.body
//     if (!email || !password || !firstName || !lastName || !mobile)
//         return res.status(400).json({
//             success: false,
//             mes: "Missing Input "
//         })
//     const user = await User.findOne({ email })
//     if (user) {
//         throw new Error("User has existed")
//     } else {
//         const newUser = await User.create(req.body)
//         return res.status(200).json({
//             success: newUser ? true : false,
//             mes: newUser ? 'Register is successfully, Please go login' : 'Something went wrong'
//         })
//     }
// });
const register = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, mobile } = req.body
    if (!email || !password || !firstName || !lastName || !mobile)
        return res.status(400).json({
            success: false,
            mes: "Missing Input "
        })
    const user = await User.findOne({ email })
    if (user) {
        throw new Error("User has existed")
    } else {
        const token = makeToken()
        const emailHash = btoa(email) + '@' + token
        const newUser = await User.create({
            email: emailHash, password, firstName, lastName, mobile
        })
        // res.cookie('dataRegister', { ...req.body, token }, { httpOnly: true, maxAge: 15 * 60 * 1000 })
        if (newUser) {
            const html = `<h2>Register code:</h2><br></br><blockquote>${token}</blockquote> `
            await sendMail({ email, html, subject: 'Complete Register Account' })
        }
        setTimeout(async () => {
            await User.deleteOne({ email: emailHash })
        }, 30000)
        return res.json({
            success: newUser ? true : false,
            mes: newUser ? 'Please check your email to active account' : 'Some thing went wrong, please try again !!!'
        })
    }
})

const finalRegister = asyncHandler(async (req, res) => {
    // const cookie = req.cookies
    const { token } = req.params
    const notActivedEmail = await User.findOne({ email: new RegExp(`${token}$`) })
    if (notActivedEmail) {
        notActivedEmail.email = atob(notActivedEmail?.email?.split('@')[0])
        notActivedEmail.save()
    }
    return res.json({
        success: notActivedEmail ? true : false,
        mes: notActivedEmail ? 'Register Successfully, ready to login' : 'Something went wrong, please try later !!!'
    })
    // if (!cookie || cookie?.dataRegister?.token !== token) {
    //     res.clearCookie('dataRegister')
    //     return res.redirect(`${process.env.CLIENT_URL}/final-register/failed`)
    // }
    // const newUser = await User.create({
    //     email: cookie?.dataRegister?.email,
    //     password: cookie?.dataRegister?.password,
    //     mobile: cookie?.dataRegister?.mobile,
    //     firstName: cookie?.dataRegister?.firstName,
    //     lastName: cookie?.dataRegister?.lastName
    // })
    // if (newUser) return res.redirect(`${process.env.CLIENT_URL}/final-register/success`)
    // else return res.redirect(`${process.env.CLIENT_URL}/final-register/failed`)
})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password)
        return res.status(400).json({
            success: false,
            mes: "Missing Input "
        })
    const response = await User.findOne({ email })
    if (response && await response.isCorrectPassword(password)) {
        // Remove pwd, role form response
        const { password, role, refreshToken, ...userData } = response.toObject()
        // Create access token after user login
        const accessToken = generateAccessToken(response._id, role)
        // Create refresh Token after user login
        const newRefreshToken = generateRefreshToken(response._id)
        // Save refresh Token in DB
        await User.findByIdAndUpdate(response._id, { refreshToken: newRefreshToken }, { new: true })
        // Save refresh Token on cookie
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 })// millisecond in 30 days
        return res.status(200).json({
            success: true,
            accessToken,
            userData
        })
    } else {
        throw new Error("Invalid credentials")
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('-refreshToken -password').populate({
        path: 'cart',
        populate: {
            path: 'product',
            select: 'title thumb price'
        }
    })
    return res.status(200).json({
        success: user ? true : false,
        rs: user ? user : "User not found !!!"
    })
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    // Get token in the cookies
    const cookie = req.cookies
    // Check token have life
    if (!cookie && !cookie.refreshToken) throw new Error('No refresh token in cookies')
    //Check legit of token
    const rs = jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({ _id: rs._id, refreshToken: cookie.refreshToken })
    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response ? generateAccessToken(response._id, response.role) : "Refresh token not matched"
    })
})

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie || !cookie.refreshToken) throw new Error("No fresh token in cookies")
    // Delete refreshToken in the DB
    await User.findOneAndUpdate({ refreshToken: cookie.refreshToken }, { refreshToken: '' }, { new: true })
    // Delete refresh Token on the cookie
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
    })
    return res.status(200).json({
        success: true,
        mes: 'Logout is done'
    })
})

//Client send mail
//Server check legit of mail => Send email with link (password change token)
//Client check mail => click link
// Client sent api and token
//Check token same with token sended by server

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body
    if (!email) throw new Error('Missing email')
    const user = await User.findOne({ email })
    if (!user) throw new Error('User not found')
    const resetToken = user.createPasswordChangedToken()
    await user.save()
    // Send Mail
    const html = `Please clink on here to change for your password (This link will expire after 15 minutes ). !!! <a href=${process.env.CLIENT_URL}/reset-password/${resetToken}>Click here</a>`
    const data = {
        email,
        html,
        subject: 'Forgot Password'
    }
    const rs = await sendMail(data)
    return res.status(200).json({
        success: rs.response?.includes('OK') ? true : false,
        mes: rs.response?.includes('OK') ? 'Please check your email !!!' : 'Some thing went wrong, please try again !!!'
    })
})

const resetPwd = asyncHandler(async (req, res) => {
    const { password, token } = req.body
    if (!password || !token) throw new Error('Missing inputs')
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ passwordResetToken, passwordResetExpires: { $gt: Date.now() } })
    if (!user) throw new Error('Invalid reset token')
    user.password = password
    user.passwordResetToken = undefined
    user.passwordChangeAt = Date.now()
    user.passwordResetExpires = undefined
    await user.save()
    return res.status(200).json({
        success: user ? true : false,
        mes: user ? 'Updated password' : 'Something went wrong'
    })
})

const getUsers = asyncHandler(async (req, res) => {
    const queries = { ...req.query }
    const excludeFields = ['limit', 'sort', 'page', 'fields']

    excludeFields.forEach(el => delete queries[el])

    let queryString = JSON.stringify(queries)
    queryString = queryString.replace(/\b(gte|gt|lt|gte)\b/g, el => `$${el}`)

    let formatQueries = JSON.parse(queryString)

    if (queries?.name) formatQueries.name = { $regex: queries.name, $options: 'i' }
    if (req.query.q) {
        delete formatQueries.q
        formatQueries['$or'] = [
            { firstName: { $regex: req.query.q, $options: 'i' } },
            { lastName: { $regex: req.query.q, $options: 'i' } },
            { email: { $regex: req.query.q, $options: 'i' } },
            { mobile: { $regex: req.query.q, $options: 'i' } },
        ]
    }

    let queryCommand = User.find(formatQueries)

    if (req.query.sort) {
        const sortBy = req.query.sort.split('').join(' ')
        queryCommand = queryCommand.sort(sortBy)
    }

    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ')
        queryCommand = queryCommand.select(fields)
    }

    const page = +req.query.page || 1
    const limit = +req.query.limit || process.env.LIMIT_PRODUCTS
    const skip = (page - 1) * limit
    queryCommand.skip(skip).limit(limit)

    queryCommand.then(async (response) => {
        const counts = await User.find(formatQueries).select('-refreshToken -role -password').countDocuments()
        return res.status(200).json({
            success: response ? true : false,
            counts,
            users: response ? response : "Cannot get user",
        })
    }).catch((err) => {
        if (err) throw new Error(err.message)
    })
    // const response = await User.find().select('-refreshToken -role -password')
    // return res.status(200).json({
    //     success: response ? true : false,
    //     user: response
    // })
})

const deleteUser = asyncHandler(async (req, res) => {
    const { uid } = req.params;
    const response = await User.findByIdAndDelete(uid)
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? `User with email: ${response.email} deleted` : "No user delete"
    })
})

const updateUser = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { firstName, lastName, email, phone } = req.body;
    const data = { firstName, lastName, email, phone }
    if (req.file) data.avatar = req.file.path
    if (!_id || Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    const response = await User.findByIdAndUpdate(_id, data, { new: true }).select('-password -role -refreshToken')
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? response : "Some thing went wrongs !!!"
    })
})

const updateUserByAdmin = asyncHandler(async (req, res) => {
    const { uid } = req.params;
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    const response = await User.findByIdAndUpdate(uid, req.body, { new: true }).select('-password -role -refreshToken')
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? 'Updated' : "Some thing went wrongs !!!"
    })
})

const updateUserAdd = asyncHandler(async (req, res) => {
    const { _id } = req.user
    if (!req.body.address) throw new Error('Missing Inputs')
    const response = await User.findByIdAndUpdate(_id, { $push: { address: req.body.address } }, { new: true }).select('-password -role -refreshToken')
    return res.status(200).json(
        {
            success: response ? true : false,
            updatedUser: response ? response : "Some thing went wrongs !!!"
        }
    )
})

const updateCartAdd = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { pid, quantity = 1, color } = req.body
    if (!pid || !color) throw new Error('Missing Inputs')
    const user = await User.findById(_id).select('cart')
    const alreadyProduct = user?.cart?.find(el => el.product.toString() === pid)
    if (alreadyProduct) {
        const response = await User.updateOne({ cart: { $elemMatch: alreadyProduct } }, { $set: { "cart.$.quantity": quantity, "cart.$.color": color } }, { new: true })
        return res.status(200).json(
            {
                success: response ? true : false,
                mes: response ? 'Updated' : "Some thing went wrongs !!!"
            }
        )
    } else {
        const response = await User.findByIdAndUpdate(_id, { $push: { cart: { product: pid, quantity, color } } }, { new: true })
        return res.status(200).json(
            {
                success: response ? true : false,
                mes: response ? 'Updated your cart' : "Some thing went wrongs !!!"
            }
        )
    }
})

const removeProductCart = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { pid } = req.params
    const user = await User.findById(_id).select('cart')
    const alreadyProduct = user?.cart?.find(el => el.product.toString() === pid)
    if (!alreadyProduct) {
        return res.status(200).json(
            {
                success: true,
                mes: 'Updated your cart'
            }
        )
    }
    const response = await User.findByIdAndUpdate(_id, { $pull: { cart: { product: pid } } }, { new: true })
    return res.status(200).json(
        {
            success: response ? true : false,
            mes: response ? 'Updated your cart' : "Some thing went wrongs !!!"
        }
    )
})


const insertUsers = asyncHandler(async (req, res) => {
    const response = await User.create(users)
    return res.status(200).json({
        success: response ? true : false,
        users: response ? response : 'Wrong'
    })
})
module.exports = {
    register,
    finalRegister,
    login,
    getCurrentUser,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPwd,
    getUsers,
    deleteUser,
    updateUser,
    updateUserByAdmin,
    updateUserAdd,
    updateCartAdd,
    insertUsers,
    removeProductCart
}
