const Order = require('../models/order')
const User = require('../models/user')
const asyncHandler = require('express-async-handler')


const createOrderNew = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const userCart = await User.findById(_id).select('cart')
    return res.status(200).json({
        success: userCart ? true : false,
        createOrderNew: userCart ? userCart : "Cannot create new Order"
    })
})

module.exports = {
    createOrderNew
}