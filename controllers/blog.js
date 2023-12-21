const Blog = require('../models/blog')
const asyncHandler = require('express-async-handler')


const createBlogNew = asyncHandler(async (req, res) => {
    const { title, description, category } = req.body
    if (!title || !description || !category) throw new Error("Missing inputs")
    const response = await Blog.create(req.body)
    return res.status(200).json({
        success: response ? true : false,
        createBlogNew: response ? response : "Cannot create new Blog"
    })
})
const updateBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    const response = await Blog.findByIdAndUpdate(bid, req.body, { new: true })
    return res.status(200).json({
        success: response ? true : false,
        updateBlog: response ? response : 'Cannot update a blog'
    })
})
const getBlog = asyncHandler(async (req, res) => {
    const response = await Blog.find()
    return res.status(200).json({
        success: response ? true : false,
        getBlog: response ? response : 'Cannot get a blog'
    })
})

const deleteBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params
    const response = await Blog.findByIdAndDelete(bid)
    return res.status(200).json({
        success: response ? true : false,
        deleteBlog: response ? response : 'Some thing went wrong'
    })
})

// When user like a blog then 
//1 server check this user have disliked that blog => Cancel disliked
//2 Check that user before user have liked ? => Cancel like
const likeBlog = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { bid } = req.params
    if (!bid) throw new Error('Missing input')
    const blog = await Blog.findById(bid)
    const alreadyDisliked = blog.disLikes?.find(el => el.toString() === _id)
    if (alreadyDisliked) {
        const response = await Blog.findByIdAndUpdate(bid, { $pull: { disLikes: _id } }, { new: true })
        return res.json({
            success: response ? true : false,
            rs: response
        })
    }
    const isLiked = blog?.likes.find(el => el.toString() === _id)
    if (isLiked) {
        const response = await Blog.findByIdAndUpdate(bid, { $pull: { likes: _id } }, { new: true })
        return res.json({
            success: response ? true : false,
            rs: response
        })
    } else {
        const response = await Blog.findByIdAndUpdate(bid, { $push: { likes: _id } }, { new: true })
        return res.json({
            success: response ? true : false,
            rs: response
        })
    }
})

const disLikeBlog = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { bid } = req.params
    if (!bid) throw new Error('Missing input')
    const blog = await Blog.findById(bid)
    const alreadyLiked = blog.likes?.find(el => el.toString() === _id)
    if (alreadyLiked) {
        const response = await Blog.findByIdAndUpdate(bid, { $pull: { likes: _id } }, { new: true })
        return res.json({
            success: response ? true : false,
            rs: response
        })
    }
    const isDisLiked = blog?.disLikes.find(el => el.toString() === _id)
    if (isDisLiked) {
        const response = await Blog.findByIdAndUpdate(bid, { $pull: { disLikes: _id } }, { new: true })
        return res.json({
            success: response ? true : false,
            rs: response
        })
    } else {
        const response = await Blog.findByIdAndUpdate(bid, { $push: { disLikes: _id } }, { new: true })
        return res.json({
            success: response ? true : false,
            rs: response
        })
    }
})
const getBlogById = asyncHandler(async (req, res) => {
    const { bid } = req.params
    const blog = await Blog.findByIdAndUpdate(bid, { $inc: { numberViews: 1 } }, { new: true }).populate('likes', 'firstName lastName').populate('likes', 'firstName lastName')
    return res.json({
        success: blog ? true : false,
        getBlogById: blog ? blog : "Can not get blog"
    })
})

const uploadImageBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params
    if (!req.file) throw new Error('Missing input')
    const response = await Blog.findByIdAndUpdate(bid, { images: req.file.path }, { new: true })
    return res.status(200).json({
        status: response ? true : false,
        updatedBlog: response ? response : "Cannot Upload Blog"
    })
})
module.exports = {
    createBlogNew,
    updateBlog,
    getBlog,
    deleteBlog,
    likeBlog,
    disLikeBlog,
    getBlogById,
    uploadImageBlog
}