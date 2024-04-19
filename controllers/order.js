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
    const data = { products, total, orderBy: _id }
    if (status) data.status = status
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
    const queries = { ...req.query }
    const { _id } = req.user
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach(el => delete queries[el])
    let queryString = JSON.stringify(queries)
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedEl => `$${matchedEl}`)
    const formatQueries = JSON.parse(queryString)
    // let colorQueryObj = {}
    // if (queries?.title) formatQueries.title = { $regex: queries.title, $options: 'i' }
    // if (queries?.category) formatQueries.category = { $regex: queries.category, $options: 'i' }
    // if (queries?.color) {
    //     delete formatQueries.color;
    //     const colorArr = queries.color?.split(',');
    //     const colorQuery = colorArr.map(el => ({ color: { $regex: el, $options: 'i' } }));
    //     colorQueryObj = { $or: colorQuery };
    // }
    // let queryObject = {}
    // if (queries?.q) {
    //     delete formatQueries.q
    //     queryObject = {
    //         $or: [
    //             { color: { $regex: queries.q, $options: 'i' } },
    //             { title: { $regex: queries.q, $options: 'i' } },
    //             { category: { $regex: queries.q, $options: 'i' } },
    //             { brand: { $regex: queries.q, $options: 'i' } },
    //         ]
    //     }
    // }
    const qr = {
        // ...colorQueryObj,
        ...formatQueries,
        orderBy: _id,
        // ...queryObject
    }
    let queryCommand = Order.find(qr)
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
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
        const counts = await Order.find(qr).countDocuments()
        return res.status(200).json({
            success: response ? true : false,
            counts,
            orders: response ? response : 'Somethings went wrong',
        })
    }).catch((err) => {
        if (err) throw new Error(err.message)
    })
})
const getUserOrderByAdmin = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const queries = { ...req.query }
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach(el => delete queries[el])
    let queryString = JSON.stringify(queries)
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedEl => `$${matchedEl}`)
    const formatQueries = JSON.parse(queryString)
    const qr = {
        // ...colorQueryObj,
        ...formatQueries,
        orderBy: _id,
        // ...queryObject
    }
    let queryCommand = Order.find(qr)
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
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
        const counts = await Order.find(qr).countDocuments()
        return res.status(200).json({
            success: response ? true : false,
            counts,
            orders: response ? response : 'Somethings went wrong',
        })
    }).catch((err) => {
        if (err) throw new Error(err.message)
    })
})
module.exports = {
    createOrderNew,
    updateStatusOrder,
    getUserOrder,
    getUserOrderByAdmin
}