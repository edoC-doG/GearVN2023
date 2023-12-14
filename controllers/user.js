const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')


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

module.exports = {
    register,
    login,
    getCurrentUser,
}
