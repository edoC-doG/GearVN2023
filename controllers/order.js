const Order = require('../models/order')
const User = require('../models/user')
const Coupon = require('../models/coupons')
const asyncHandler = require('express-async-handler')


const createOrderNew = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { products, total, address, status } = req.body
    if (address) {
        await User.findByIdAndUpdate(_id, { address, cart: [] })
    }
    const data = { products, total, postedBy: _id }
    if (status) data.status = status
    console.log(data)
    const rs = await Order.create(data)
    return res.status(200).json({
        success: rs ? true : false,
        mes: rs ? rs : "Some thing went wrongs"
    })
})

const updateStatusOrder = asyncHandler(async (req, res) => {
    const { oid } = req.params
    const { status } = req.body
    if (!status) throw new Error('Missing Status')
    const response = await Order.findByIdAndUpdate(oid, { status }, { new: true })
    return res.json({
        success: response ? true : false,
        response: response ? response : 'Somethings went wrong'
    })
})

const getUserOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const response = await Order.find({ orderBy: _id })
    return res.json({
        success: response ? true : false,
        response: response ? response : 'Somethings went wrong'
    })
})
const getUserOrderByAdmin = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const response = await Order.find({ orderBy: _id })
    return res.json({
        success: response ? true : false,
        response: response ? response : 'Somethings went wrong'
    })
})
module.exports = {
    createOrderNew,
    updateStatusOrder,
    getUserOrder,
    getUserOrderByAdmin
}