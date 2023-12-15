const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')

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
        const newUser = await User.create(req.body)
        return res.status(200).json({
            success: newUser ? true : false,
            mes: newUser ? 'Register is successfully, Please go login' : 'Something went wrong'
        })
    }
});

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
        const { password, role, ...userData } = response.toObject()
        // Create access token after user login
        const accessToken = generateAccessToken(response._id, role)
        // Create refresh Token after user login
        const refreshToken = generateRefreshToken(response._id)
        // Save refresh Token in DB
        await User.findByIdAndUpdate(response._id, { refreshToken }, { new: true })
        // Save refresh Token on cookie
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 })// millisecond in 30 days
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
    const user = await User.findById(_id).select('-refreshToken -role -password')
    return res.status(200).json({
        success: false,
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
module.exports = {
    register,
    login,
    getCurrentUser,
    refreshAccessToken,
    logout,
}
