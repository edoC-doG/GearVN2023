const ProductCategory = require('../models/productCategory')
const asyncHandler = require('express-async-handler')

const createProductCategory = asyncHandler(async (req, res) => {
    const response = await ProductCategory.create(req.body)
    return res.status(200).json({
        success: response ? true : false,
        createProductCategory: response ? response : "Cannot create new category of product"
    })
})

const updateProductCategory = asyncHandler(async (req, res) => {
    const { pcid } = req.params
    const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, { new: true })
    return res.status(200).json({
        success: response ? true : false,
        createProductCategory: response ? response : "Cannot update category of product"
    })
})

const deleteProductCategory = asyncHandler(async (req, res) => {
    const { pcid } = req.params
    const response = await ProductCategory.findByIdAndDelete(pcid)
    return res.status(200).json({
        success: response ? true : false,
        createProductCategory: response ? response : "Cannot delete category of product"
    })
})

const getProductCategory = asyncHandler(async (req, res) => {
    const response = await ProductCategory.find().select('title _id')
    return res.status(200).json({
        success: response ? true : false,
        createProductCategory: response ? response : "Cannot get category of product"
    })
})

module.exports = {
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    getProductCategory,
}