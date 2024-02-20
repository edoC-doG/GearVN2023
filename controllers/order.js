const Order = require('../models/order')
const User = require('../models/user')
const Coupon = require('../models/coupons')
const asyncHandler = require('express-async-handler')


const createOrderNew = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { coupon } = req.body
    const userCart = await User.findById(_id).select('cart').populate('cart.product', 'title price')
    const products = userCart?.cart?.map(el => ({
        product: el.product._id,
        count: el.quantity,
        color: el.color
    }))
    let total = userCart?.cart?.reduce((sum, el) => el.product.price * el.quantity + sum, 0)
    const createData = { products, total, orderBy: _id }
    if (coupon) {
        const selectCoupon = await Coupon.findById(coupon)
        total = Math.round(total * (1 - +selectCoupon?.discount / 100) / 1000) * 1000 || total
        createData.total = total,
            createData.coupon = coupon
    }
    const rs = await Order.create(createData)
    return res.status(200).json({
        success: rs ? true : false,
        rs: rs ? rs : "Some thing went wrongs"
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