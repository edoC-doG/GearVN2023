const Coupons = require('../models/coupons')
const asyncHandler = require('express-async-handler')

const createCoupons = asyncHandler(async (req, res) => {
    const { name, discount, expiry } = req.body
    if (!name || !discount || !expiry) throw new Error('Missing inputs')
    const response = await Coupons.create({
        ...req.body,
        expiry: Date.now() + expiry * 24 * 60 * 60 * 1000
    })
    return res.status(200).json({
        success: response ? true : false,
        createBrand: response ? response : "Cannot create new Coupons"
    })
})

const getCoupons = asyncHandler(async (req, res) => {
    const response = await Coupons.find().select('-createdAt -updatedAt')
    return res.status(200).json({
        success: response ? true : false,
        createBrand: response ? response : "Cannot get Coupons"
    })
})

const updateCoupons = asyncHandler(async (req, res) => {
    const { cid } = req.params;
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    if (req.body.expiry) req.body.expiry = Date.now() + +req.body.expiry * 24 * 60 * 60 * 1000
    const response = await Coupons.findByIdAndUpdate(cid, req.body, { new: true })
    return res.status(200).json({
        success: response ? true : false,
        createBrand: response ? response : "Cannot update Coupons"
    })
})

const deleteCoupons = asyncHandler(async (req, res) => {
    const { cid } = req.params;
    const response = await Coupons.findByIdAndDelete(cid)
    return res.status(200).json({
        success: response ? true : false,
        createBrand: response ? response : "Cannot delete Coupons"
    })
})
module.exports = {
    createCoupons,
    getCoupons,
    updateCoupons,
    deleteCoupons

}