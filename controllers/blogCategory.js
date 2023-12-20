const BlogCategory = require('../models/blogCategory')
const asyncHandler = require('express-async-handler')

const createBlogCategory = asyncHandler(async (req, res) => {
    const response = await BlogCategory.create(req.body)
    return res.status(200).json({
        success: response ? true : false,
        createBlogCategory: response ? response : "Cannot create new BlogCategory"
    })
})

const updateBlogCategory = asyncHandler(async (req, res) => {
    const { pcid } = req.params
    const response = await BlogCategory.findByIdAndUpdate(pcid, req.body, { new: true })
    return res.status(200).json({
        success: response ? true : false,
        updateBlogCategory: response ? response : "Cannot update BlogCategory"
    })
})

const deleteBlogCategory = asyncHandler(async (req, res) => {
    const { pcid } = req.params
    const response = await BlogCategory.findByIdAndDelete(pcid)
    return res.status(200).json({
        success: response ? true : false,
        deleteBlogCategory: response ? response : "Cannot delete BlogCategory"
    })
})

const getBlogCategory = asyncHandler(async (req, res) => {
    const response = await BlogCategory.find().select('title _id')
    return res.status(200).json({
        success: response ? true : false,
        getBlogCategory: response ? response : "Cannot get BlogCategory"
    })
})

module.exports = {
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory,
    getBlogCategory,
}