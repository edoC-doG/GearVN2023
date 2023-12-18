const ProductCategory = require('../models/productCategory')
const asyncHandler = require('express-async-handler')

const createBlogCategory = asyncHandler(async (req, res) => {
    const response = await ProductCategory.create(req.body)
    return res.status(200).json({
        success: response ? true : false,
        createProductCategory: response ? response : "Cannot create new BlogCategory"
    })
})

const updateBlogCategory = asyncHandler(async (req, res) => {
    const { pcid } = req.params
    const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, { new: true })
    return res.status(200).json({
        success: response ? true : false,
        createProductCategory: response ? response : "Cannot update BlogCategory"
    })
})

const deleteBlogCategory = asyncHandler(async (req, res) => {
    const { pcid } = req.params
    const response = await ProductCategory.findByIdAndDelete(pcid)
    return res.status(200).json({
        success: response ? true : false,
        createProductCategory: response ? response : "Cannot delete BlogCategory"
    })
})

const getBlogCategory = asyncHandler(async (req, res) => {
    const response = await ProductCategory.find().select('title _id')
    return res.status(200).json({
        success: response ? true : false,
        createProductCategory: response ? response : "Cannot get BlogCategory"
    })
})

module.exports = {
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory,
    getBlogCategory,
}