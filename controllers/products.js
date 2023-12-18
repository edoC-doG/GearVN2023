const Product = require('../models/products');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const { options } = require('../routes/product');

const createProduct = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
    const newProduct = await Product.create(req.body)
    return res.status(200).json({
        success: newProduct ? true : false,
        createProduct: newProduct ? newProduct : "Cannot create new product"
    })
})

const getProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params;
    const product = await Product.findById(pid)
    return res.status(200).json({
        success: product ? true : false,
        productData: product ? product : "Cannot get product"
    })
})

//Filtering, sorting && pagination
const getProducts = asyncHandler(async (req, res) => {
    const queries = { ...req.query }

    // Tách các trường đặt biệt ra khỏi querry
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach(el => delete queries[el])

    // Format lai cac operator cho dung cu phap cua MongoDB
    let queryString = JSON.stringify(queries)
    queryString = queryString.replace(/\b(gte|gt|lt|gte)\b/g, el => `$${el}`)
    const formatQueries = JSON.parse(queryString)

    //Filtering
    if (queries?.title) formatQueries.title = { $regex: queries.title, $options: 'i' }
    let queryCommand = Product.find(formatQueries)

    //Sorting
    if (req.query.sort) {
        const sortBy = req.query.sort.split('').join(' ')
        queryCommand = queryCommand.sort(sortBy)
    }
    // Fields limiting

    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ')
        queryCommand = queryCommand.select(fields)
    }

    //Pagination
    // + limit: Số object lấy về 1 gọi API
    // Skip: 2
    // 1 2 /3 ... 10
    const page = +req.query.page || 1
    const limit = +req.query.limit || process.env.LIMIT_PRODUCTS
    const skip = (page - 1) * limit
    queryCommand.skip(skip).limit(limit)
    //Execute query
    // So luong san pham thoa man dieu kien !== so luong san pham tra ve 1 lan goi API
    queryCommand.exec(async (err, response) => {
        if (err) throw new Error(err.message)
        const counts = await Product.find(formatQueries).countDocuments()
        return res.status(200).json({
            success: response ? true : false,
            counts,
            products: response ? response : "Cannot get products",
        })
    })
})

const updateProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params;
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
    const updateProduct = await Product.findByIdAndUpdate(pid, req.body, { new: true })
    return res.status(200).json({
        success: updateProduct ? true : false,
        updateProduct: updateProduct ? updateProduct : "Cannot update product"
    })
})

const deleteProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params;
    if (!pid) throw new Error('Missing inputs')
    const deleteProduct = await Product.findByIdAndDelete(pid)
    return res.status(200).json({
        success: deleteProduct ? true : false,
        updateProduct: deleteProduct ? "Deleted Product" : "Cannot delete product"
    })
})

const ratings = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { star, comment, pid } = req.body
    if (!star || !pid) throw new Error('Missing Inputs')
    const ratingProduct = await Product.findById(pid)
    const alreadyRating = ratingProduct?.ratings?.find(el => el.postedBy.toString() === _id)
    if (alreadyRating) {
        await Product.updateOne({
            ratings: { $elemMatch: alreadyRating }
        }, {
            $set: { "ratings.$.star": star, "ratings.$.comment": comment }
        }, { new: true })
        //Update star & comment
    } else {
        // add star & comment
        await Product.findByIdAndUpdate(pid, {
            $push: { ratings: { star, comment, postedBy: _id } }
        }, { new: true })

    }

    // Sum ratings

    const updateProduct = await Product.findById(pid)
    const ratingCount = updateProduct.ratings.length
    const sumRatings = updateProduct.ratings.reduce((sum, el) => sum + +el.star, 0)
    updateProduct.totalRatings = Math.round(sumRatings * 10 / ratingCount) / 10

    await updateProduct.save()

    return res.status(200).json({
        status: true,
    })
})
module.exports = {
    createProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    ratings
}