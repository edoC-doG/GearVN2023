const Brand = require('../models/brand')
const asyncHandler = require('express-async-handler')

const createBrand = asyncHandler(async (req, res) => {
    const response = await Brand.create(req.body)
    return res.status(200).json({
        success: response ? true : false,
        createBrand: response ? response : "Cannot create new category of Brand"
    })
})

const updateBrand = asyncHandler(async (req, res) => {
    const { pcid } = req.params
    const response = await Brand.findByIdAndUpdate(pcid, req.body, { new: true })
    return res.status(200).json({
        success: response ? true : false,
        updateBrand: response ? response : "Cannot update category of Brand"
    })
})

const deleteBrand = asyncHandler(async (req, res) => {
    const { pcid } = req.params
    const response = await Brand.findByIdAndDelete(pcid)
    return res.status(200).json({
        success: response ? true : false,
        deleteBrand: response ? response : "Cannot delete category of Brand"
    })
})

const getBrand = asyncHandler(async (req, res) => {
    const response = await Brand.find().select('title _id')
    return res.status(200).json({
        success: response ? true : false,
        getBrand: response ? response : "Cannot get category of Brand"
    })
})

module.exports = {
    createBrand,
    updateBrand,
    deleteBrand,
    getBrand,
}